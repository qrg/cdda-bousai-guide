'use strict';

import {app} from 'electron';

import PrimaryWindow from './primary-window';
import Config from './config';
import Items from './items';

class Main {

  constructor() {
    this.config = new Config();
    this.items = new Items({
      config: this.config
    });

    app.on('ready', () => this.onReady());
    app.on('window-all-closed', () => this.onWindowAllClosed());
    this.config.on('initialized', () => this.onConfigInitialized());
  }

  onReady() {
    this.config.initialize();
  }

  onWindowAllClosed() {
    app.quit();
  }

  onConfigInitialized() {
    this.primaryWindow = new PrimaryWindow(this.config);

    if (process.env.NODE_ENV === 'development') {
      require('./install-devtools')();
    }

    // TODO: DELETE
    this.primaryWindow.window.openDevTools();
  }

}

export default new Main();
