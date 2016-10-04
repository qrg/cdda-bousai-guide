'use strict';

import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import {SRC_PATH, DIST_PATH} from './path-config';

const RESOURCES = [
  path.join(SRC_PATH, 'icon', '**', '*.+(icns|ico|png)'),
  path.join(SRC_PATH, 'renderer', '**', '*.+(html|css|jpg|png|gif|svg|woff)'),
  path.join(SRC_PATH, 'config.json')
];

RESOURCES
  .map(pattern => glob.sync(pattern))
  .reduce((values, value) => [...values, ...value])
  .forEach(src => {
    const dist = src.replace(SRC_PATH, DIST_PATH);
    fs.copySync(src, dist, {clobber: true});
    console.log(dist);
  });
