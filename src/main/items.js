'use strict';

import fs from 'fs';
import glob from 'glob';
import {CACHE_PATH} from './config-path';
import {isString} from './lib/string';

const CACHE_FILE = `${CACHE_PATH}/items.json`;

export function findById(id, items) {
  return items.find(v => v.id === id);
}

const deleteInheritanceKeys = (item) => {
  ['relative', 'extend', 'proportional', 'delete'].forEach(key => delete item[key]);
  return item;
};

const inheritRelative = (base, sub) => {
  const result = {};
  Object.keys(sub.relative).forEach(key => {
    const baseValue = base[key] || 0;
    result[key] = baseValue + sub.relative[key];
  });
  return result;
};

const inheritProportional = (base, sub) => {
  const result = {};
  Object.keys(sub.proportional).forEach(key => {
    const baseValue = base[key] || 0;
    const ratio = sub.proportional[key] * 100;
    result[key] = Math.trunc(baseValue * ratio / 100);
  });
  return result;
};

const inheritExtend = (base, sub) => {
  const result = {};
  Object.keys(sub.extend).forEach(key => {
    const baseValues = base[key] || [];
    const subValues = sub.extend[key] || [];
    result[key] = [...new Set([...baseValues, ...subValues])];
  });
  return result;
};

const inheritDelete = (base, sub) => {
  const result = {};
  Object.keys(sub.delete).forEach(key => {
    const values = base[key] || [];
    const exclusions = sub.delete[key] || [];
    result[key] = values.filter(v => !exclusions.includes(v));
  });
  return result;
};

export function inherit(base, sub, items) {
  if (!base) {
    return deleteInheritanceKeys(sub);
  }

  if (base.hasOwnProperty('copy-from')) {
    // inherit recursively
    const origin = findById(base['copy-from'], items);
    base = inherit(origin, base, items);
  }

  let result = {...base, ...sub};

  if (sub.hasOwnProperty('relative')) {
    result = {...result, ...inheritRelative(base, sub)};
  }
  if (sub.hasOwnProperty('proportional')) {
    result = {...result, ...inheritProportional(base, sub)};
  }
  if (sub.hasOwnProperty('extend')) {
    result = {...result, ...inheritExtend(base, sub)};
  }
  if (sub.hasOwnProperty('delete')) {
    result = {...result, ...inheritDelete(result, sub)};
  }

  deleteInheritanceKeys(result);
  return result;
}

const filterOutIgnoreItems = item => {
  const IGNORE_ITEM_TYPE = ['item_group', 'ammunition_type', 'MIGRATION'];
  const IGNORE_CONDITIONS = [
    (item) => IGNORE_ITEM_TYPE.every(itemType => itemType !== item.type)
  ];
  return IGNORE_CONDITIONS.every(cond => cond(item));
};

const buildInheritedItems = (item, index, items) => {
  if (!item.hasOwnProperty('copy-from')) {
    return item;
  }
  const baseItem = findById(item['copy-from'], items);
  return inherit(baseItem, item, items);
};

export default class Items {

  constructor(config) {
    this.config = config;
  }

  async initialize(translations) {
    this._translations = translations;
    this._items = await this.read();
  }

  getAll() {
    return this._items;
  }

  async read() {
    let items;
    try {
      items = await this.readCache();
      return items;
    } catch (e) {
      console.log('Items cache file was not exist.');
      const itemsData = await this.readJsonFiles();
      items = this.build(itemsData);
      console.log('Successfully built items.');
      this.saveCache(items);
      return items;
    }
  }

  async readCache() {
    console.log('Loading items cache...');
    return await new Promise((done, reject) => {
      fs.readFile(CACHE_FILE, 'utf8', (err, data) => {
        if (err) return reject(err);
        return done(JSON.parse(data));
      });
    });
  }

  async readJsonFiles() {
    const pattern = `${this.config.jsonDir}/items/**/*.json`;
    const jsonPaths = await new Promise((done, reject) => {
      glob(pattern, (err, files) => {
        if (err) return reject(err);
        return done(files);
      });
    });

    console.log(`Reading item json files from ${pattern}`);
    const readFiles = jsonPaths.map(file => {
      return new Promise((done, reject) => {
        fs.readFile(file, 'utf8', (err, data) => {
          if (err) return reject(err);
          const parsed = JSON.parse(data.toString());
          return done(parsed);
        });
      });
    });

    return await Promise.all(readFiles);
  }

  build(itemsData) {
    console.log('Building items data...');
    return itemsData
      .reduce((contents, content) => [...contents, ...content])
      .filter(filterOutIgnoreItems)
      .map(buildInheritedItems)
      .map(this._mergeTranslations, this);
  }

  async saveCache(items) {
    console.log(`Saving items cache file ${CACHE_FILE}`);
    return await new Promise((done, reject) => {
      const data = JSON.stringify(items, null, 2);
      fs.writeFile(CACHE_FILE, data, 'utf8', (err) => {
        if (err) reject(err);
        return done();
      });
    });
  }

  async deleteCache() {
    return await new Promise((done, reject) => {
      fs.unlink(CACHE_FILE, (err) => {
        if (err) return reject(err);
        return done();
      });
    });
  }

  _mergeTranslations(item) {
    item.translation = {};
    Object.keys(item).forEach(key => {
      if (!isString(item[key])) return;
      const translated = this._translations.find(t => item[key] === t.msgid);
      if (!translated) return;
      item.translation[key] = translated.msgstr[0];
    });
    return item;
  }

}

