'use strict';

import fs from 'fs';
import parser from 'gettext-parser';
import glob from 'glob';
import {ROOT} from './config-path';

const translations = (() => {
  const {lang, mo_dir} = JSON.parse(fs.readFileSync(`${ROOT}/config.json`));

  if (lang === '') return [];

  const moPaths = glob.sync(`${mo_dir}/${lang}/**/*.mo`);

  return moPaths
    .map(moPath => {
      const mo = fs.readFileSync(moPath);
      const parsed = parser.mo.parse(mo).translations[''];
      return Object.keys(parsed).map(key => parsed[key]);
    })
    .reduce((values, value) => {
      return [...values, ...value];
    }, []);
})();

export default translations;
