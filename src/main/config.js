'use strict';

import EventEmitter from 'events';
import {join, dirname, basename} from 'path';
import {readJson, outputJson, access, constants} from 'fs-extra';
import glob from 'glob';
import {ipcMain as ipc} from 'electron';

import {CONFIG_JSON} from './paths';
import {isPlainObject, filterObject} from '../lib/object';
import {isString} from '../lib/string';

const DEFAULT_CONFIG = {
  lang: 'en',
  exe_path: '',
  mo_dir: '',
  json_dir: '',
  window_x: undefined,
  window_y: undefined,
  window_width: 800,
  window_height: 600
};

const isReadable = (path) => {
  return new Promise((done) => {
    access(path, constants.R_OK, (err) => {
      if (err) done(false);
      done(true);
    });
  }).catch(err => {
    throw new Error(err);
  });
};

const isExeForMac = (path) => {
  return /\/[^\/]+?.app$/.test(path);
};

const getBaseFromExePath = (path) => {
  return (
    isExeForMac(path)
      ? join(path, 'Contents', 'Resources')
      : dirname(path)
  );
};
const getJsonDir = (path) => join(path, 'data', 'json');
const getMoDir = (path) => join(path, 'lang', 'mo');

const hasJsonDir = (path) => {
  const dir = getJsonDir(path);
  return isReadable(dir);
};

const hasMoDir = (path) => {
  const dir = getMoDir(path);
  return isReadable(dir);
};

const removeEmptyEntries = (configData) => {
  return filterObject(configData, (config, key) => {
    return config[key] && (config[key] !== '');
  });
};

export default class Config extends EventEmitter {

  constructor() {
    super();
    this._config = {...DEFAULT_CONFIG};
    ipc.on('main:request-exe-path-validation', Config.onRequestExePathValidation);
    ipc.on('main:request-lang-list', (...args) => this.onRequestLangList(...args));
    ipc.on('main:request-save-config', (...args) => this.onRequestSaveConfig(...args));
  }

  async initialize() {
    try {
      await this.restore();
      this.emit('initialized');
    } catch (e) {
      if (e.code !== 'ENOENT') {
        // TODO notify
        console.error('Config file initializing failed.');
        console.error(e);
        return;
      }
      // TODO notify
      console.log('Create new config.json as default settings', e.path);
      try {
        this.store();
        this.emit('initialized');
      } catch (e) {
        console.error(e);
      }

    }
  }

  getAll() {
    return this._config;
  }

  get(key) {
    return this._config[key];
  }

  set(key, value) {
    if (isPlainObject(key)) {
      Object.keys(key).forEach((k) => {
        this.set(k, key[k]);
      });
    }
    this._config[key] = value;
  }

  has(key) {
    const val = this._config[key];
    return (val !== '' && val !== null && typeof val !== 'undefined');
  }

  merge(data = {}) {
    this._config = {
      ...removeEmptyEntries(this.getAll()),
      ...removeEmptyEntries(data)
    };
  }

  store() {
    return new Promise((done, reject) => {
      outputJson(CONFIG_JSON, removeEmptyEntries(this.getAll()), err => {
        if (err) reject(err);
        console.log('Saved config file successfully.');
        done();
      });
    });
  }

  restore() {
    return new Promise((done, reject) => {
      readJson(CONFIG_JSON, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        this.merge(data);
        console.log('Restored config successfully.');
        done();
      });
    });
  }

  async onRequestLangList(event, exePath) {
    const channel = 'main:reply-lang-list';
    try {
      const baseDir = getBaseFromExePath(exePath);
      const moDir = getMoDir(baseDir);
      const defaultValue = this.get('lang');
      const dirs = await Config.readLangDirList(moDir);
      const langs = dirs.map(dir => basename(dir));
      langs.unshift('en');
      event.sender.send(channel, null, {langs, defaultValue});
    } catch (e) {
      console.error(e);
      event.sender.send(channel, e, null);
    }
  }

  async onRequestSaveConfig(event, config) {
    const channel = 'main:reply-save-config';
    const {sender} = event;
    try {
      const {exe_path, lang} = config;
      const isValid = [exe_path, lang].every(v => {
        return v !== '' && v !== null && typeof v !== 'undefined';
      });

      if (!isValid) {
        // TODO notify
        throw new Error('Invalid config');
      }

      const baseDir = getBaseFromExePath(exe_path);

      this.merge({
        ...config,
        mo_dir: getMoDir(baseDir),
        json_dir: getJsonDir(baseDir),
      });

      await this.store();
      sender.send(channel, null, {
        file: CONFIG_JSON,
        data: this.getAll()
      });

    } catch (e) {
      console.error(e);
      sender.send(channel, e, {
        file: CONFIG_JSON,
        data: this.getAll()
      });
    }
  }

  static async onRequestExePathValidation(event, exePath) {
    const channel = 'main:reply-exe-path-validation';
    try {
      if (!isString(exePath)) {
        console.error('path must be String');
      }
      const {isValid, errors} = await Config.validateExePath(exePath);
      event.sender.send(channel, null, {isValid, errors, exePath});
    } catch (e) {
      console.error(e);
      event.sender.send(channel, e, null);
    }
  }

  static async validateExePath(exePath) {
    const errors = [];
    const baseDir = getBaseFromExePath(exePath);
    const hasJson = await hasJsonDir(baseDir);
    const hasMo = await hasMoDir(baseDir);

    if (!hasJson) errors.push(`${getJsonDir(baseDir)} is not readable or it does not exist.`);
    if (!hasMo) errors.push(`${getMoDir(baseDir)} is not readable or it does not exist.`);

    return {
      isValid: hasJson && hasMo,
      errors: errors
    };
  }

  static readLangDirList(moDir) {
    const pattern = `${moDir}/*/`;
    return new Promise((done, reject) => {
      glob(pattern, {mark: true}, (err, dirs) => {
        if (err) reject(err);
        done(dirs);
      });
    });
  }

}
