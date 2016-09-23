'use strict';

import fs from 'fs';
import glob from 'glob';
import translations from './translations';

const IGNORE_ITEM_TYPE = ['item_group', 'MIGRATION'];
const IGNORE_CONDITIONS = [
  (item) => IGNORE_ITEM_TYPE.every(itemType => itemType !== item.type)
];

const items = (() => {
  const {json_dir} = JSON.parse(fs.readFileSync('./config.json'));
  const jsonPaths = glob.sync(`${json_dir}/items/**/*.json`);

  return jsonPaths
    .map(file => JSON.parse(fs.readFileSync(file, 'utf8')))
    .reduce((contents, content) => [...contents, ...content])
    .filter(item => IGNORE_CONDITIONS.every(cond => cond(item)))
    .map(item => {
      const t = translations.find(t => t.msgid === item.name);
      const words = t ? t.msgstr : [];
      return {
        ...item,
        translations: words
      };
    });

})();

/*fs.writeFileSync(
 './tmp/items.json',
 JSON.stringify(translations, null, 2),
 'utf8'
 );*/

export default items;
