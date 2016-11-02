'use strict';

import {app, ipcMain as ipc} from 'electron';

import setAppMenu from './menu';
import PrimaryWindow from './primary-window';
import Config from './config';
import Items from './items';
import Indexer from './indexer';

import search from './search';

class Main {

  constructor() {
    // initialize config -> items -> indexer
    this.config = new Config();

    app.on('ready', () => this.onReady());
    app.on('window-all-closed', () => this.onWindowAllClosed());
    ipc.on('main:request-items-init', (event) => this.onRequestItemsInit(event));
    ipc.on('main:request-search', (...args) => this.onRequestSearch(...args));
    this.config.on('initialized', () => this.onConfigInitialized());
  }

  onReady() {
    this.config.initialize();
    setAppMenu();
  }

  onWindowAllClosed() {
    app.quit();
  }

  onConfigInitialized() {
    this.primaryWindow = new PrimaryWindow(this.config);

    if (process.env.NODE_ENV === 'development') {
      require('../lib/install-devtools')();
      this.primaryWindow.window.openDevTools();
    }

  }

  onRequestItemsInit(event) {
    const channelP = 'main:items-init-progress';
    const channelI = 'main:items-initialized';
    const {sender} = event;
    const onItemsInitProgress = (err, state) => sender.send(channelP, err, state);
    const onItemsInitialized = (err) => {
      console.log('onItemsInitialized');
      sender.send(channelI, err);
      this.indexer = new Indexer(this.items, {
        lang: this.config.get('lang'),
        ignoreKeys: this.config.get('index_ignore_keys')
      });
      this.indexer.initialize();
    };

    this.items = new Items({
      lang: this.config.get('lang'),
      jsonDir: this.config.get('json_dir'),
      moDir: this.config.get('mo_dir')
    });

    this.items.removeAllListeners('init-progress');
    this.items.removeAllListeners('initialized');
    this.items.on('build-progress', onItemsInitProgress);
    this.items.on('loading-progress', onItemsInitProgress);
    this.items.on('initialized', onItemsInitialized);
    this.items.initialize();
  }

  onRequestSearch(event, term) {
    console.log('onRequestSearch', term);
    const channel = 'main:reply-search';
    const {sender} = event;
    try {
      const {results, searchTime} = search(term, this.items, this.indexer, this.config.get('lang'));
      sender.send(channel, null, {results, searchTime});
    } catch (e) {
      console.error(e);
      sender.send(channel, e, {results: []});
    }

  }

}

export default new Main();
