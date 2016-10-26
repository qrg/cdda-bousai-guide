'use strict';

import {createReadStream, outputJson} from 'fs-extra';
import EventEmitter from 'events';
import JSONStream from 'JSONStream';
import {isPlainObject} from '../lib/object';

export default class Store extends EventEmitter {

  constructor(storeName, version, filePath) {
    super();
    this.storeName = storeName;
    this.version = version;
    this.filePath = filePath;
    this._data = new Map();
  }

  load() {
    const name = this.storeName;
    const file = this.filePath;
    return new Promise((done, reject) => {
      console.log(`Loading ${name}...`);

      let max = 0;

      const stream = createReadStream(file, {encoding: 'utf8'})
        .on('error', (err) => {
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
            message: 'Need to migrate',
            code: 'MIGRATE'
          });
        }
        max = rows_length;
      });

      stream.on('data', (data) => {
        const [key, value] = data;
        if (key) {
          this.set(key, value);
        }

        const count = this.size;
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
        rows: [...this._data.entries()].sort()
      };

      outputJson(this.filePath, output, {spaces: 2}, (err) => {
        if (err) reject(err);
        console.log(`Saved ${this.filePath} Successfully`);
        done();
      });
    });
  }

  set(key, value) {
    if (isPlainObject(key)) {
      return Object.keys(key).forEach((k) => {
        this._data.set(k, key[k]);
      });
    }
    return this._data.set(key, value);
  }

  get(key) {
    return this._data.get(key);
  }

  has(key) {
    return this._data.has(key);
  }

  get size() {
    return this._data.size;
  }

  entries() {
    return this._data.entries();
  }

}
