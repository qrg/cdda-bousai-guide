'use strict';

import {BrowserWindow} from 'electron';
import debounce from 'lodash.debounce';
import {
  productName as PRODUCT_NAME,
  version as VERSION
} from '../../package.json';
import logger from './logger';

const INDEX_HTML = `file://${__dirname}/../renderer/index.html`;
const INITIAL_BG_COLOR = '#2A535E'; // display until finishing apply stylesheet

export default class PrimaryWindow {

  constructor(config) {
    this.config = config;
    this.window = new BrowserWindow({
      show: false,
      x: this.config.get('window_x'),
      y: this.config.get('window_y'),
      width: this.config.get('window_width'),
      height: this.config.get('window_height'),
      minWidth: 320,
      minHeight: 568,
      backgroundColor: INITIAL_BG_COLOR,
      title: `${PRODUCT_NAME} ${VERSION}`,
      titleBarStyle: 'hidden-inset'
    });

    this.window.once('ready-to-show', () => this.onReadyToShow());
    this.window.once('closed', () => this.onClosed());
    this.window.on('move', debounce(() => this.onMove(), 300));
    this.window.on('resize', debounce(() => this.onResize(), 300));
    this.window.loadURL(INDEX_HTML);

    if (process.platform !== 'darwin') {
      this.window.setAutoHideMenuBar(true);
    }
  }

  onReadyToShow() {
    logger.log('primary window is ready to show.');
    this.window.show();
  }

  onClosed() {
    logger.log('Primary window is closed.');
    this.window = null;
  }

  onMove() {
    const [x, y] = this.window.getPosition();
    this.config.set('window_x', x);
    this.config.set('window_y', y);
    logger.log('window move', x, y);
    this.config.save();
  }

  onResize() {
    const [width, height] = this.window.getSize();
    this.config.set('window_width', width);
    this.config.set('window_height', height);
    logger.log('window resize', width, height);
    this.config.save();
  }

}
