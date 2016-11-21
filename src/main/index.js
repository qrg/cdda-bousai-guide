'use strict';

import {app, ipcMain as ipc, dialog} from 'electron';
import setAppMenu from './menu';
import PrimaryWindow from './primary-window';
import Config from './config';
import Items from './items';
import Indexer from './indexer';
import logger from './logger';
import search from './search';

const {showOpenDialog} = dialog;

class Main {

  constructor() {
    // initialize config -> items -> indexer
    this.config = new Config();
    this.shouldRebuildIndexer = false;
    this.isRebuilding = false;

    app.on('ready', () => this.onReady());
    app.on('window-all-closed', () => this.onWindowAllClosed());
    ipc.on('request-items-init', (...args) => this.onRequestItemsInit(...args));
    ipc.on('request-open-dialog', (...args) => this.onRequestOpenDialog(...args));
    ipc.on('request-search', (...args) => this.onRequestSearch(...args));
    this.config.on('init-done', () => this.onConfigInitDone());
  }

  onReady() {
    this.config.initialize();
  }

  onWindowAllClosed() {
    app.quit();
  }

  onConfigInitDone() {
    this.primaryWindow = new PrimaryWindow(this.config);

    if (process.env.NODE_ENV === 'development') {
      require('../lib/install-devtools')();
      this.primaryWindow.window.openDevTools();
    }

    const contents = this.primaryWindow.window.webContents;
    setAppMenu(this.primaryWindow);

    logger.on('info', (...args) => {
      contents.send('info', ...args);
    });
    logger.on('error', (...args) => {
      contents.send('error', ...args);
    });

  }

  onRequestItemsInit(event, options) {
    const {sender} = event;

    if (this.isRebuilding) {
      return;
    }

    this.isRebuilding = true;

    this.items = new Items({
      lang: this.config.get('lang'),
      jsonDir: this.config.get('json_dir'),
      moDir: this.config.get('mo_dir')
    });

    this.items.removeAllListeners('build-start');
    this.items.removeAllListeners('build-progress');
    this.items.removeAllListeners('build-done');
    this.items.removeAllListeners('init-done');
    this.items.on('build-start', (...args) => this.onItemsBuildStart(sender, ...args));
    this.items.on('build-progress', (...args) => this.onItemsBuildProgress(sender, ...args));
    this.items.on('build-done', () => this.onItemsBuildDone(sender));
    this.items.on('init-done', (...args) => this.onItemsInitDone(sender, ...args));
    this.items.initialize(options);
  }

  onRequestOpenDialog(event, options, callback) {
    showOpenDialog(this.primaryWindow, options, callback);
  }

  onItemsBuildStart(sender) {
    const channel = 'items-build-start';
    sender.send(channel);
  }

  onItemsBuildProgress(sender, err, state) {
    const channel = 'items-build-progress';
    sender.send(channel, err, state);
  }

  onItemsBuildDone(sender) {
    const channel = 'items-build-done';
    this.shouldRebuildIndexer = true;
    sender.send(channel);
  }

  onItemsInitDone(sender) {
    this.indexer = new Indexer(this.items, {
      lang: this.config.get('lang'),
      ignoreKeys: this.config.get('index_ignore_keys')
    });

    this.indexer.removeAllListeners('build-start');
    this.indexer.removeAllListeners('build-progress');
    this.indexer.removeAllListeners('build-done');
    this.indexer.on('build-start', () => this.onIndexerBuildStart(sender));
    this.indexer.on('build-progress', (...args) => this.onIndexerBuildProgress(sender, ...args));
    this.indexer.on('build-done', (...args) => this.onIndexerBuildDone(sender, ...args));
    this.indexer.on('init-done', () => this.onIndexerInitDone(sender));
    this.indexer.initialize({rebuild: this.shouldRebuildIndexer});
  }

  onIndexerBuildStart(sender) {
    const channel = 'indexer-build-start';
    sender.send(channel);
  }

  onIndexerBuildProgress(sender, err, state) {
    const channel = 'indexer-build-progress';
    sender.send(channel, err, state);
  }

  onIndexerBuildDone(sender) {
    const channel = 'indexer-build-done';
    sender.send(channel);
  }

  onIndexerInitDone(sender) {
    const channel = 'indexer-init-done';
    this.shouldRebuildIndexer = false;
    this.isRebuilding = false;
    sender.send(channel);
  }

  onRequestSearch(event, term) {
    logger.info('search term:', term);
    const channel = 'reply-search';
    const {sender} = event;
    try {
      const {results, searchTime} = search(term, this.items, this.indexer, this.config.get('lang'));
      sender.send(channel, null, {results, searchTime});
    } catch (e) {
      logger.error(e);
      sender.send(channel, e, {results: []});
    }

  }

}

export default new Main();
