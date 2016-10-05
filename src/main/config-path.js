'use strict';

import path from 'path';
import {app} from 'electron';

export const ROOT = path.join(__dirname, '..');
export const CACHE_PATH = path.join(ROOT, 'cache');
export const USER_DATA = app.getPath('userData');
export const CONFIG_JSON = `${USER_DATA}/config.json`;
