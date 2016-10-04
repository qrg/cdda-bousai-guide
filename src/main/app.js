'use strict';

import fs from 'fs';
import Config from './config';
import Items from './items';
import Translations from './translations';

import {ROOT} from './config-path';
const CONFIG_FILE = `${ROOT}/config.json`;

export default class App {

  async initialize() {
    const configJson = await this.readConfigJson();
    this.config = new Config(configJson);
    this.translations = new Translations(this.config);
    this.items = new Items(this.config);
    await this.translations.initialize();
    await this.items.initialize(this.translations.getAll());
  }

  async readConfigJson() {
    return await new Promise((done, reject) => {
      fs.readFile(CONFIG_FILE, (err, data) => {
        if (err) reject(err);
        return done(JSON.parse(data));
      });
    });
  }

}
