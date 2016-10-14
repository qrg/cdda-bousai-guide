'use strict';

import EventEmitter from 'events';
import JSONStream from 'JSONStream';
import {join} from 'path';
import {ipcMain as ipc} from 'electron';
import {createReadStream, readJson, writeJson, unlink} from 'fs-extra';
import glob from 'glob';

import Translations from './translations';
import {buildInheritedItems} from './inherit-items';
import {USER_DATA} from './paths';
import {isString} from '../lib/string';
import wait from '../lib/wait';

const IGNORE_ITEM_TYPE = ['item_group', 'ammunition_type', 'MIGRATION'];

const filterOutIgnoreItems = item => {
  const IGNORE_CONDITIONS = [
    (item) => IGNORE_ITEM_TYPE.every(itemType => itemType !== item.type)
  ];
  return IGNORE_CONDITIONS.every(cond => cond(item));
};

export default class Items extends EventEmitter {

  constructor({config}) {
    super();
    this.config = config;
    ipc.on('main:request-items-ready', (event) => this.onRequestItemsReady(event));
    ipc.on('main:request-items-init', (event) => this.initialize(event));
  }

  get cacheFile() {
    return join(USER_DATA, `items-${this.config.get('lang')}.json`);
  }

  getEntries() {
    return this._items;
  }

  onRequestItemsReady(event) {
    const channel = 'main:reply-items-ready';
    const {sender} = event;
    if (this.isRequiredConfig()) {
      sender.send(channel, null, {isReady: false});
      return;
    }
    sender.send(channel, null, {isReady: true});
  }

  initialize(event) {
    const channelP = 'main:items-init-progress';
    const channelI = 'main:items-initialized';
    const {sender} = event;
    const onInitProgress = (err, state) => {
      sender.send(channelP, err, state);
    };
    const onInitialized = (err) => {
      sender.send(channelI, err);
    };
    this.removeAllListeners('init-progress');
    this.removeAllListeners('initialized');
    this.on('init-progress', onInitProgress);
    this.on('initialized', onInitialized);
    this.read();
  }

  isRequiredConfig() {
    return ['lang', 'json_dir', 'mo_dir'].some(key => {
      return !this.config.has(key);
    });
  }

  async read() {
    let _items;
    try {
      const rows = await this.restore();

      this.emit('initialized');
      this._items = rows;

    } catch (err) {
      if (err.code !== 'ENOENT') {
        return console.error(err);
      }
      console.log('Items cache file does not exist.');
      _items = await this.build();
      console.log('Successfully built items.');
      this._items = _items;
      this.store();
      this.emit('initialized');
    }
  }

  restore() {
    return new Promise((done, reject) => {
      console.log('Loading items cache...');

      let max = 0;
      let count = 0;
      let rows = [];

      const stream = createReadStream(this.cacheFile, {encoding: 'utf8'})
        .on('error', (err) => reject(err))
        .pipe(JSONStream.parse('rows.*'));

      stream.on('end', () => {
        console.log('Successfully read items cache.');
        done(rows);
      });

      stream.on('header', (data) => {
        max = data.rows_length;
      });

      stream.on('data', (data) => {
        count += 1;
        rows = [...rows, data];
        if (max === 0) {
          return;
        }
        this.emit('init-progress', null, {
          max: max,
          value: count,
          rate: Math.round(count / max * 100)
        });
      });

    });
  }

  collectSources() {
    console.log('collectSources');
    const jsonDir = this.config.get('json_dir');
    const pattern = `${jsonDir}/items/**/*.json`;
    const jsonPaths = glob.sync(pattern);

    //console.log(jsonPaths);

    console.log(`Reading item json files from ${pattern}`);
    const readFileTasks = jsonPaths.map(file => {
      return new Promise((done, reject) => {
        readJson(file, (err, data) => {
          if (err) {
            reject(err);
          }
          done(data);
        });
      });
    });

    return Promise.all(readFileTasks);
  }

  async build() {
    console.log('Building items data...');
    try {
      const sources = await this.collectSources();
      const translations = await this.initTranslations();
      let items;

      console.log('items: Collecting items data.');
      items = sources.reduce((items, item) => [...items, ...item]);

      console.log('items: Filtering items data.');
      items = items.filter(filterOutIgnoreItems);

      console.log('items: Computing inherited items.');
      items = items.map(buildInheritedItems);

      console.log('items: Mapping translations to items.');
      this.emit('init-progress', null, {
        max: items.length,
        value: 0,
        rate: 0
      });

      const tasks = items.map((item, i) => {
        return (values) => {
          return new Promise((done) => {
            this.mergeTranslations(item, translations).then(value => {
              const result = [...values, value];

              this.emit('init-progress', null, {
                max: items.length,
                value: i,
                rate: Math.round(i / items.length * 100)
              });

              wait(4).then(() => done(result));
            });
          });
        };
      });

      // async series
      return tasks.reduce((prev, next) => {
        return prev.then((values) => next(values));
      }, Promise.resolve([]));

      //return Promise.all(tasks).then(vals => vals);
    } catch (e) {
      console.error(e);
    }
  }

  async initTranslations() {
    const translations = new Translations({
      lang: this.config.get('lang'),
      moDir: this.config.get('mo_dir')
    });
    await translations.initialize();
    return translations;
  }

  async store() {
    console.log(`Saving items cache file ${this.cacheFile}`);
    return await new Promise((done, reject) => {
      const data = {
        rows_length: this._items.length,
        rows: this._items
      };
      writeJson(this.cacheFile, data, {spaces: 2}, (err) => {
        if (err) return reject(err);
        return done();
      });
    }).catch(err => console.error(err));
  }

  async deleteCache() {
    return await new Promise((done, reject) => {
      unlink(this.cacheFile, (err) => {
        if (err) return reject(err);
        return done();
      });
    }).catch(err => console.error(err));
  }

  mergeTranslations(item, translations) {
    item.translation = {};
    const tasks = Object.keys(item).map(key => {
      const val = item[key];
      return new Promise(done => {
        if (!isString(val)) {
          done(item);
        }
        const translation = translations.findById(val);
        if (!translation) {
          done(item);
        }
        item.translation[key] = translation.msgstr[0];
        done(item);
      }).catch(err => console.error(err));
    });

    return Promise.all(tasks).then(vals => {
      return vals.reduce((prev, val) => {
        return {...prev, ...val};
      }, {});
    });
  }

}
