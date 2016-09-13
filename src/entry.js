'use strict';

import fs from 'fs';
import parser from 'gettext-parser';
import search from './search';

const term = process.argv[2];

const dict = (() => {
  const map = new Map();
  const translation = (() => {
    const {mo} = JSON.parse(fs.readFileSync('./config.json'));
    const moContent = fs.readFileSync(mo);
    return parser.mo.parse(moContent).translations[''];
  })();

  Object.keys(translation).forEach(key => map.set(key, translation[key]));

  return map;
})();

const results = search(term, dict);

const print = (results) => {

  if (results.length === 0) {
    console.log('Nothing matched.');
    return;
  }

  const SEP = '-------------------------------------------------------------------------------';

  results.forEach(val => {
    console.log(SEP);
    console.log(val.msgid);
    if (Array.isArray(val.msgstr)) {
      return val.msgstr.forEach(str => console.log(str));
    }
    console.log(val.msgstr);
  });

  console.log(SEP);
};

print(results);
