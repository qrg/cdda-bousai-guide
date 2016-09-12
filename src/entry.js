'use strict';

import fs from 'fs';
import parser from 'gettext-parser';

const config = JSON.parse(fs.readFileSync('./config.json'));
const PATH_MO = config.mo;
const mo = fs.readFileSync(PATH_MO);
const parsed = parser.mo.parse(mo).translations[''];

const translation = new Map();
Object.keys(parsed).forEach(key => translation.set(key, parsed[key]));

const term = '弾薬';

const isIncluded = (v) => {
  if (Array.isArray(v)) {
    return v.some(str => str.includes(term));
  }
  return v.includes(term);
};

const matched = new Map(
  [...translation].filter(([k, v]) => isIncluded(v.msgstr))
);

console.log(matched);
