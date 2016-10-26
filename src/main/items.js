'use strict';

import {join} from 'path';
import {readJson, unlink} from 'fs-extra';
import glob from 'glob';
import uuid from 'uuid';

import Store from './store';
import Translations from './translations';
import {buildInheritedItems} from '../lib/inherit-items';
import {USER_DATA} from './paths';
import {isString} from '../lib/string';
import wait from '../lib/wait';

const IGNORE_TYPE_NAMES = ['item_group', 'ammunition_type', 'MIGRATION'];
const BUILD_INTERVAL_MS = 4;

const filterOutIgnoreItems = item => {
  const IGNORE_CONDITIONS = [
    (item) => IGNORE_TYPE_NAMES.every(itemType => itemType !== item.type)
  ];
  return IGNORE_CONDITIONS.every(cond => cond(item));
};

export default class Items extends Store {

  constructor({lang, jsonDir, moDir}) {
    super('items', '0.0.1', join(USER_DATA, `items-${lang}.json`));
    this.lang = lang;
    this.jsonDir = jsonDir;
    this.moDir = moDir;
  }

  async initialize() {
    try {

      await this.load();
      this.emit('initialized');

    } catch (e) {

      if (e.code !== 'ENOENT' && e.code !== 'VERSION_CONFLICT') {
        console.error(e);
        return;
      }

      await this.build();
      console.log('Successfully built items.');
      this.save();
      this.emit('initialized');
    }
  }

  collectSources() {
    console.log('collectSources');
    const pattern = `${this.jsonDir}/items/**/*.json`;
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
        return () => {
          return new Promise((done) => {
            this.mergeTranslations(item, translations).then(value => {
              this.set(uuid.v4(), value);

              this.emit('build-progress', null, {
                max: items.length,
                value: i,
                rate: Math.round(i / items.length * 100)
              });

              wait(BUILD_INTERVAL_MS).then(() => done());
            });
          });
        };
      });

      // async series
      return tasks.reduce((prev, next) => {
        return prev.then(next);
      }, Promise.resolve());

    } catch (e) {
      console.error(e);
    }
  }

  async initTranslations() {
    const translations = new Translations({
      lang: this.lang,
      moDir: this.moDir
    });
    await translations.initialize();
    return translations;
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
