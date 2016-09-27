'use strict';

import fs from 'fs';
import parser from 'gettext-parser';
import glob from 'glob';

export default class Translations {

  constructor(config) {
    this.config = config;
  }

  async initialize() {
    this._translations = await this.parse();
  }

  getAll() {
    return this._translations;
  }

  async parse() {
    if (this.config.lang === '') return [];

    const moContents = await this.read();

    console.log('Parsing mo files...');

    return moContents
      .map(mo => {
        const parsed = parser.mo.parse(mo).translations[''];
        return Object.keys(parsed).map(key => parsed[key]);
      })
      .reduce((values, value) => {
        return [...values, ...value];
      }, []);
  }

  async read() {
    const {lang, moDir} = this.config;
    const pattern = `${moDir}/${lang}/**/*.mo`;

    console.log(`Reading mo files from ${pattern}`);

    const moPaths = await new Promise((done, reject) => {
      glob(pattern, (err, files) => {
        if (err) return reject(err);
        return done(files);
      });
    });

    const readFiles = moPaths.map(file => {
      return new Promise((done, reject) => {
        fs.readFile(file, (err, data) => {
          if (err) return reject(err);
          return done(data);
        });
      });
    });

    return await Promise.all(readFiles);
  }

}
