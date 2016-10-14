'use strict';

import {readFile} from 'fs';
import parser from 'gettext-parser';
import glob from 'glob';

export default class Translations {

  constructor({lang, moDir}) {
    this.lang = lang;
    this.moDir = moDir;
  }

  async initialize() {
    try {
      this._translations = await this.parse();
    } catch (e) {
      console.error(e);
    }
  }

  getAll() {
    return this._translations;
  }

  async parse() {
    const lang = this.lang;
    if (lang === 'en') {
      return [];
    }

    try {
      const moContents = await this.read();
      console.log('Parsing mo files...');

      return moContents
        .map(mo => {
          const parsed = parser.mo.parse(mo).translations[''];
          return Object.keys(parsed).map(key => parsed[key]);
        })
        .reduce((values, value) => [...values, ...value], []);
    } catch (e) {
      return console.error(e);
    }
  }

  async read() {
    const pattern = `${this.moDir}/${this.lang}/**/*.mo`;

    console.log(`Reading mo files from ${pattern}`);

    const moPaths = await new Promise((done, reject) => {
      glob(pattern, (err, files) => {
        if (err) reject(err);
        done(files);
      });
    }).catch(e => {
      return console.error(e);
    });

    const readFiles = moPaths.map(file => {
      return new Promise((done, reject) => {
        readFile(file, (err, data) => {
          if (err) return reject(err);
          return done(data);
        });
      }).catch(e => {
        return console.error(e);
      });
    });

    return Promise.all(readFiles);
  }

  findById(id) {
    return this._translations.find(t => {
      return id === t.msgid;
    });
  }

}
