'use strict';

import Store from './store';
import {basename} from 'path';
import {ipcMain as ipc} from 'electron';

import logger from './logger';
import {isString} from '../lib/string';
import {
  CONFIG_JSON,
  getJsonDir,
  getMoDir,
  getCDDARootPathByExePath,
  validateExePath,
  readLangDirList
} from './paths';

const DEFAULT_CONFIG = new Map([
  ['lang', 'en'],
  ['exe_path', ''],
  ['mo_dir', ''],
  ['json_dir', ''],
  ['window_x', undefined],
  ['window_y', undefined],
  ['window_width', 800],
  ['window_height', 600],
  ['index_ignore_keys', [
    'id',
    'color',
    'symbol',
    'name_plural'
  ]]
]);

export default class Config extends Store {

  constructor() {
    super('config', '0.0.1', CONFIG_JSON);

    DEFAULT_CONFIG.forEach((v, k) => this.set(k, v));

    ipc.on('main:request-config-status', (event) => this.onRequestConfigStatus(event));
    ipc.on('main:request-exe-path-validation', Config.onRequestExePathValidation);
    ipc.on('main:request-lang-list', (...args) => this.onRequestLangList(...args));
    ipc.on('main:request-save-config', (...args) => this.onRequestSaveConfig(...args));
  }

  validate(key) {
    const val = this.get(key);
    return (val !== '' && val !== null && typeof val !== 'undefined');
  }

  async onRequestLangList(event, exePath) {
    const channel = 'main:reply-lang-list';
    try {
      const baseDir = getCDDARootPathByExePath(exePath);
      const moDir = getMoDir(baseDir);
      const defaultValue = this.get('lang');
      const dirs = await readLangDirList(moDir);
      const langs = dirs.map(dir => basename(dir));
      langs.unshift('en');
      event.sender.send(channel, null, {langs, defaultValue});
    } catch (e) {
      logger.error(e);
      event.sender.send(channel, e, null);
    }
  }

  async onRequestSaveConfig(event, values) {
    const channel = 'main:reply-save-config';
    const {sender} = event;
    try {
      const [exe_path, lang] = values;
      const baseDir = getCDDARootPathByExePath(exe_path);

      this.set('exe_path', exe_path);
      this.set('lang', lang);
      this.set('mo_dir', getMoDir(baseDir));
      this.set('json_dir', getJsonDir(baseDir));

      await this.save();

      sender.send(channel, null, {
        file: CONFIG_JSON,
        data: this.entries()
      });

    } catch (e) {
      logger.error(e);
      sender.send(channel, e, {
        file: CONFIG_JSON,
        data: this.entries()
      });
    }
  }

  hasMissingConfig() {
    return ['lang', 'json_dir', 'mo_dir'].some(key => !this.validate(key));
  }

  onRequestConfigStatus(event) {
    const channel = 'main:reply-config-status';
    const {sender} = event;
    if (this.hasMissingConfig()) {
      sender.send(channel, null, {isFulfilled: false});
      return;
    }
    sender.send(channel, null, {isFulfilled: true});
  }

  static async onRequestExePathValidation(event, exePath) {
    const channel = 'main:reply-exe-path-validation';
    try {
      if (!isString(exePath)) {
        logger.error('path must be String');
      }
      const errMsgs = await validateExePath(exePath);
      event.sender.send(channel, null, {errMsgs, exePath});
    } catch (e) {
      logger.error(e);
      event.sender.send(channel, e, null);
    }
  }

}
