'use strict';

import Store from './store';
import {basename} from 'path';
import {ipcMain as ipc} from 'electron';

import logger from './logger';
import {isString} from '../lib/string';
import {camelToSnake} from '../lib/string';
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

    ipc.on('request-config-status', (event) => this.onRequestConfigStatus(event));
    ipc.on('request-exe-path-validation', Config.onRequestExePathValidation);
    ipc.on('request-lang-list', (...args) => this.onRequestLangList(...args));
    ipc.on('request-save-config', (...args) => this.onRequestSaveConfig(...args));
    ipc.on('request-preferences', (...args) => this.onRequestPreferences(...args));
  }

  async readLangList(exePath) {
    const baseDir = getCDDARootPathByExePath(exePath);
    const moDir = getMoDir(baseDir);
    const dirs = await readLangDirList(moDir);
    const langs = dirs.map(dir => basename(dir));
    langs.unshift('en');
    return langs;
  }

  async onRequestLangList(event, exePath) {
    const channel = 'reply-lang-list';
    try {
      const langs = await this.readLangList(exePath);
      const defaultValue = this.get('lang');
      event.sender.send(channel, {langs, defaultValue});
    } catch (e) {
      logger.error(e);
    }
  }

  async onRequestSaveConfig(event, conf) {
    const channel = 'reply-save-config';
    const {sender} = event;
    try {

      Object.keys(conf).forEach(k => {
        console.log(camelToSnake(k), conf[k]);
        this.set(camelToSnake(k), conf[k]);
      });

      const baseDir = getCDDARootPathByExePath(this.get('exe_path'));

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
    const channel = 'reply-config-status';
    const {sender} = event;
    if (this.hasMissingConfig()) {
      sender.send(channel, null, {isFulfilled: false});
      return;
    }
    sender.send(channel, null, {isFulfilled: true});
  }

  async onRequestPreferences(event) {
    const channel = 'reply-preferences';
    const {sender} = event;
    const langs = await this.readLangList(this.get('exe_path'));
    const data = {
      lang: this.get('lang'),
      langs: langs,
      exePath: this.get('exe_path'),
      indexIgnoreKeys: this.get('index_ignore_keys')
    };

    sender.send(channel, data);
  }

  static async onRequestExePathValidation(event, exePath) {
    const channel = 'reply-exe-path-validation';
    const {sender} = event;
    if (!isString(exePath)) {
      logger.error('path must be String', exePath);
    }
    try {
      const errors = await validateExePath(exePath);
      errors.forEach(m => logger.info(m));
      sender.send(channel, {errors, exePath});
    } catch (e) {
      logger.error(e);
    }
  }

  validate(key) {
    const val = this.get(key);
    return (val !== '' && val !== null && typeof val !== 'undefined');
  }

}
