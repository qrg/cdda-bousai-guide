'use strict';

import {join} from 'path';
import {TfIdf} from 'natural';
import Store from './store';
import Tokenizer from './tokenizers/tokenizer';
import logger from './logger';
import {isString} from '../lib/string';
import {USER_DATA} from './paths';
import wait from '../lib/wait';

const BUILD_INTERVAL_MS = 2;

export default class Indexer extends Store {

  constructor(docs, options) {
    const params = {
      lang: 'en',
      ignoreKeys: [],
      ...options
    };

    super('items-index', '0.0.1', join(USER_DATA, `items-${params.lang}-index.json`));

    this.docs = docs;
    this.lang = params.lang;
    this.ignoreKeys = params.ignoreKeys;
  }

  async beforeInitialSave() {
    await this.build();
  }

  async initialize(options = {rebuild: false}) {
    if (!options.rebuild) {
      super.initialize();
      return;
    }

    try {
      await this.build();
      await this.save();
      this.emit('init-done');
    } catch (e) {
      logger.error(e);
    }
  }

  async build() {
    const tasks = [];
    let count = 0;
    const max = this.docs.size;

    tasks.push(() => {
      this.emit('build-start');
      logger.info('Constructing index...');
      this._docsTexts = new Map();
    });

    this.docs.forEach((doc, id) => {
      const task = () => {
        return new Promise(done => {
          Object.keys(doc).forEach(key => {
            this.addPostingByKey(doc, id, key);
          });

          count++;

          this.emit('build-progress', null, {
            max: max,
            value: count,
          });

          wait(BUILD_INTERVAL_MS).then(() => done());
        });
      };

      tasks.push(task);
    });

    tasks.push(() => {
      this.forEach((postingList, token) => {
        const tfidf = new TfIdf();
        postingList.forEach(p => {
          const docTexts = this._docsTexts.get(p.id);
          tfidf.addDocument(docTexts, p.id);
        });

        tfidf.tfidfs([token], (i, score, id) => {
          const posting = postingList.find(p => p.id === id);
          posting.score = score;
        });
      });
      Promise.resolve();
    });

    tasks.push(() => {
      this.sortPostingList();
      Promise.resolve();
    });

    tasks.push(() => {
      logger.info('Constructed index successfully');
      this._docsTexts = null;
      this.emit('build-done');
      Promise.resolve();
    });

    return tasks.reduce((prev, next) => {
      return prev.then(next);
    }, Promise.resolve());
  }

  addPostingByKey(doc, docId, key) {
    const isValid = (key, val) => isString(val) && !this.isIgnoreKey(key);

    if (key === 'translation') {
      const translation = doc[key];
      Object.keys(translation).forEach(tk => {
        if (isValid(tk, translation[tk])) {
          const tokens = new Tokenizer(this.lang).tokenize(translation[tk]);
          this.addPosting(tokens, docId, `${key}.${tk}`);
          this._addDocText(tokens, docId);
        }
      });

      return;
    }

    if (isValid(key, doc[key])) {
      const tokens = new Tokenizer('en').tokenize(doc[key]);
      this.addPosting(tokens, docId, key);
      this._addDocText(tokens, docId);
    }
  }

  addPosting(tokens, id, key) {
    tokens.forEach(token => {
      const postingList = this.get(token);

      if (!postingList) {
        // create new posting list
        this.set(token, [{
          id: id,
          keys: [key]
        }]);
        return;
      }

      const posting = postingList.find(p => p.id === id);

      if (!posting) {
        // add new posting
        postingList.push({
          id: id,
          keys: [key]
        });
        return;
      }

      posting.keys.push(key);
    });
  }

  _addDocText(tokens, docId) {
    const val = this._docsTexts.get(docId) || [];
    this._docsTexts.set(docId, [...val, ...tokens]);
  }

  sortPostingList() {
    return new Promise(done => {
      this.forEach((list, token) => {
        const sorted = list.sort((a, b) => {
          if (a.id < b.id) return -1;
          if (a.id > b.id) return 1;
          return 0;
        });
        this.set(token, sorted);
      });
      done();
    });
  }

  load() {
    return super.load().then(() => this.attachRefs());
  }

  save() {
    return this.removeRefs()
      .then(() => super.save())
      .then(() => this.attachRefs());
  }

  attachRefs() {
    return new Promise(done => {
      this.forEach(list => {
        list.forEach(posting => {
          posting.ref = this.docs.get(posting.id);
        });
      });
      done();
    });
  }

  removeRefs() {
    return new Promise(done => {
      this.forEach(list => {
        list.forEach(posting => {
          delete posting.ref;
        });
      });
      done();
    });
  }

  isIgnoreKey(key) {
    return this.ignoreKeys.some(keyName => keyName === key);
  }

}
