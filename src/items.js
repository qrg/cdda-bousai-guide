'use strict';

import fs from 'fs';
import glob from 'glob';
import translations from './translations';
import {ROOT} from './config-path';

const IGNORE_ITEM_TYPE = ['item_group', 'ammunition_type', 'MIGRATION'];
const IGNORE_CONDITIONS = [
  (item) => IGNORE_ITEM_TYPE.every(itemType => itemType !== item.type)
];

const {json_dir} = JSON.parse(fs.readFileSync(`${ROOT}/config.json`));
const jsonPaths = glob.sync(`${json_dir}/items/**/*.json`);

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

const items = (() => {

  return jsonPaths
    .map(file => JSON.parse(fs.readFileSync(file, 'utf8')))
    .reduce((contents, content) => [...contents, ...content])
    .filter(item => IGNORE_CONDITIONS.every(cond => cond(item)))
    .map((item, index, items) => {
      if (!item.hasOwnProperty('copy-from')) {
        return item;
      }
      const baseItem = findById(item['copy-from'], items);
      return inherit(baseItem, item, items);
    })
    .map(item => {
      const t = translations.find(t => t.msgid === item.name);
      const words = t ? t.msgstr : [];
      return {...item, translations: words};
    });

})();

export default items;
