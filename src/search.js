'use strict';

import fs from 'fs';
import parser from 'gettext-parser';

const config = JSON.parse(fs.readFileSync('./config.json'));
const PATH_MO = config.mo;
const mo = fs.readFileSync(PATH_MO);
const parsed = parser.mo.parse(mo).translations[''];

const translation = new Map();
Object.keys(parsed).forEach(key => translation.set(key, parsed[key]));

const includes = (target, term) => {
  if (Array.isArray(target)) {
    return target.some(str => str.includes(term));
  }
  return target.includes(term);
};

export default function (term) {
  return new Map(
    [...translation].filter(([k, v]) => includes(v.msgstr, term))
  );
}
