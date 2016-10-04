'use strict';

import fs from 'fs-extra';
import {DIST_PATH} from './path-config';

fs.emptyDirSync(DIST_PATH);
