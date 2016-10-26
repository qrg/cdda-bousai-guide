'use strict';

import {app, ipcMain as ipc} from 'electron';

import PrimaryWindow from './primary-window';
import Config from './config';
import Items from './items';

class Main {

  constructor() {
    this.config = new Config();
    this.items = undefined;

    app.on('ready', () => this.onReady());
    app.on('window-all-closed', () => this.onWindowAllClosed());
    ipc.on('main:request-items-init', (event) => this.onRequestItemsInit(event));
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
      require('../lib/install-devtools')();
    }

    // TODO: DELETE
    this.primaryWindow.window.openDevTools();
  }

  onRequestItemsInit(event) {
    const channelP = 'main:items-init-progress';
    const channelI = 'main:items-initialized';
    const {sender} = event;
    const onInitProgress = (err, state) => sender.send(channelP, err, state);
    const onInitialized = (err) => sender.send(channelI, err);

    this.items = new Items({
      lang: this.config.get('lang'),
      jsonDir: this.config.get('json_dir'),
      moDir: this.config.get('mo_dir')
    });

    this.items.removeAllListeners('init-progress');
    this.items.removeAllListeners('initialized');
    this.items.on('build-progress', onInitProgress);
    this.items.on('loading-progress', onInitProgress);
    this.items.on('initialized', onInitialized);
    this.items.initialize();
  }

  onRequestSearch(event, term) {
    console.log('onRequestSearch', term);
    const channel = 'main:reply-search';
    const {sender} = event;
    try {
      const results = search(term, this.items);
      sender.send(channel, null, {results});
    } catch (e) {
      console.error(e);
      sender.send(channel, e, {results: []});
    }

  }

}

export default new Main();
