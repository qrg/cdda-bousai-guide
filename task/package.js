'use strict';

import pack from 'electron-packager';

import {
  productName as PRODUCT_NAME,
  version as VERSION
} from '../package.json';

const ICON = 'dist/icon/app.icns';
const PACKAGE_CONFIG = {
  dir: './',
  name: PRODUCT_NAME,
  'app-version': VERSION,
  asar: false,
  overwrite: true,
  ignore: [ // see also. node_modules/electron-packager/ignore.js
    '/\\..+?($|/)',
    '.DS_Store',
    '/release($|/)',
    '/src($|/)',
    '/task($|/)',
    '/test($|/)',
    '/node_modules($|/)'
  ]
};

const targets = [
  ['darwin', 'x64'],
  ['win32', 'x64'],
  ['linux', 'x64']
];

targets.forEach(target => {
  const platform = target[0];
  const arch = target[1];
  pack({
    ...PACKAGE_CONFIG,
    platform: platform,
    arch: arch,
    icon: ICON,
    out: 'release/'
  }, (err, appPath) => {
    if (err) {
      return console.error(err);
    }
    console.log(appPath);
  });
});
