'use strict';

export default class Config {

  constructor({
    lang = null,
    mo_dir = null,
    json_dir = null
  } = {}) {
    this.lang = lang;
    this.moDir = mo_dir;
    this.jsonDir = json_dir;
  }

}
