'use strict';

import {createReadStream, outputFile} from 'fs-extra';
import EventEmitter from 'events';
import JSONStream from 'JSONStream';
import {isPlainObject} from '../lib/object';
import {isArray} from '../lib/array';

export default class Store extends EventEmitter {

  constructor(storeName, version, filePath) {
    super();
    this.storeName = storeName;
    this.version = version;
    this.filePath = filePath;
    this._data = new Map();
  }

  beforeInitialLoad() {}

  beforeInitialSave() {}

  async initialize() {
    try {
      await this.beforeInitialLoad();
      await this.load();
      this.emit('initialized');

    } catch (e) {

      if (e.code !== 'ENOENT' && e.code !== 'VERSION_CONFLICT') {
        // TODO notify
        console.error(`${this.storeName} initializing failed.`);
        console.error(e);
        return;
      }

      // TODO notify
      console.log(`Creating new ${this.storeName} ...`, this.filePath);

      try {
        await this.beforeInitialSave();
        await this.save();
        this.emit('initialized');
      } catch (e) {
        console.error(e);
      }

    }
  }

  load() {
    const name = this.storeName;
    const file = this.filePath;
    return new Promise((done, reject) => {
      console.log(`Loading ${name} ${file} ...`);

      let max = 0;

      const stream = createReadStream(file, {encoding: 'utf8'})
        .on('error', (err) => { // require before JSONStream.parse() to reject for ENOENT
          console.log(`Failed to load ${name}.`);
          reject(err);
        })
        .pipe(JSONStream.parse('rows.*'));

      stream.on('end', () => {
        console.log(`Successfully loaded ${name}.`);
        done();
      });

      stream.on('header', (data) => {
        const {version, rows_length} = data;
        if (version !== this.version) {
          reject({
            message: `${name} version ${version} does not correspond to ${this.version}`,
            code: 'VERSION_CONFLICT'
          });
        }
        max = rows_length;
      });

      stream.on('data', (data) => {
        if (!isArray(data)) {
          return;
        }
        const [key, value] = data;
        const count = this.size;
        this.set(key, value);

        if (max === 0) {
          return;
        }

        this.emit('loading-progress', null, {
          max: max,
          value: count,
          rate: Math.round(count / max * 100)
        });
      });
    });
  }

  save() {
    console.log(`Saving ${this.filePath} ...`);

    return new Promise((done, reject) => {
      const output = {
        version: this.version,
        rows_length: this._data.size,
        rows: [...this._data].sort()
      };

      // write a compact json
      outputFile(this.filePath, JSON.stringify(output), (err) => {
        if (err) reject(err);
        console.log(`Saved ${this.filePath} Successfully`);
        done();
      });
    });
  }

  set(key, value) {
    if (isPlainObject(key)) {
      return Object.keys(key).forEach(k => {
        this._data.set(k, key[k]);
        this.emit('set', k, key[k],);
      });
    }
    this._data.set(key, value);
    this.emit('set', key, value,);
    return this._data;
  }

  get(key) {
    return this._data.get(key);
  }

  has(key) {
    return this._data.has(key);
  }

  entries() {
    return this._data.entries();
  }

  forEach(iter) {
    return this._data.forEach(iter);
  }

  get size() {
    return this._data.size;
  }

}
