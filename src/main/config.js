'use strict';

import {readJson, outputJson} from 'fs-extra';
import {CONFIG_JSON} from './config-path';
import {isPlainObject} from '../lib/object';

const DEFAULT_CONFIG = {
  lang: '',
  mo_dir: '',
  json_dir: '',
  window_x: undefined,
  window_y: undefined,
  window_width: 800,
  window_height: 600
};

const onRejected = err => {
  throw new Error(err);
};

export default class Config {

  constructor() {
    this._config = DEFAULT_CONFIG;
  }

  async initialize() {
    console.log('Config#initialize');
    return await this.restore();
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

  merge(data) {
    return this._config = {
      ...this._config,
      ...data
    };
  }

  async store() {
    console.log('Config#store');
    return await new Promise((done, reject) => {
      outputJson(CONFIG_JSON, this.getAll(), err => {
        if (err) reject(err);
        console.log('Created new config file successfully.');
        done();
      });
    }).catch(onRejected);
  }

  async restore() {
    console.log('Config#restore');
    return await new Promise((done, reject) => {
      readJson(CONFIG_JSON, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // create new config file if file does not exit
            console.log('Config file does not exist.');
            return this.store().then(() => done());
          }
          reject(err);
        }
        this.merge(data);
        console.log('Restored config successfully.');
        done();
      });
    }).catch(onRejected);
  }

}
