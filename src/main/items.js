'use strict';

import {join} from 'path';
import {readJson, unlink} from 'fs-extra';
import glob from 'glob';
import uuid from 'uuid';

import logger from './logger';
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

  async beforeInitialSave() {
    await this.build();
  }

  collectSources() {
    const pattern = `${this.jsonDir}/items/**/*.json`;
    const jsonPaths = glob.sync(pattern);

    logger.debug(jsonPaths.join('\n'));

    logger.log(`Reading item json files from ${pattern}`);
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
    logger.info('Building items data...');
    try {
      const sources = await this.collectSources();
      const translations = await this.initTranslations();
      let items;

      logger.log('items: Collecting items data.');
      items = sources.reduce((items, item) => [...items, ...item]);

      logger.log('items: Filtering items data.');
      items = items.filter(filterOutIgnoreItems);

      logger.log('items: Computing inherited items.');
      items = items.map(buildInheritedItems);

      logger.log('items: Mapping translations to items.');

      const max = items.length;

      const tasks = items.map((item, i) => {
        return () => {
          return new Promise((done) => {
            this.mergeTranslations(item, translations).then(value => {
              this.set(uuid.v4(), value);

              this.emit('build-progress', null, {
                max: max,
                value: i + 1,
              });

              wait(BUILD_INTERVAL_MS).then(() => done());
            });
          });
        };
      });

      tasks.unshift(() => {
        this.emit('build-start');
        return Promise.resolve();
      });
      tasks.push(() => {
        this.emit('build-done');
        logger.info('Built items successfully');
        return Promise.resolve();
      });

      // async series
      return tasks.reduce((prev, next) => {
        return prev.then(next);
      }, Promise.resolve());

    } catch (e) {
      logger.error(e);
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
    }).catch(e => logger.error(e));
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
      }).catch(e => logger.error(e));
    });

    return Promise.all(tasks).then(vals => {
      return vals.reduce((prev, val) => {
        return {...prev, ...val};
      }, {});
    });
  }

}
