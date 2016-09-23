'use strict';

import fs from 'fs';
import parser from 'gettext-parser';

const translations = (() => {
  const moPath = JSON.parse(fs.readFileSync('./config.json')).mo;
  const moContent = fs.readFileSync(moPath);
  const parsed = parser.mo.parse(moContent).translations[''];
  return Object.keys(parsed).map(key => parsed[key]);
})();

/*fs.writeFileSync(
  './tmp/translations.json',
  JSON.stringify(translations, null, 2),
  'utf8'
);*/

export default translations;
