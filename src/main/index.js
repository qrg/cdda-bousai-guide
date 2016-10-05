'use strict';

import {app, BrowserWindow} from 'electron';
import debounce from 'debounce';

import Config from './config';

let window;

const INDEX_HTML = `file://${__dirname}/../renderer/index.html`;
const INITIAL_BG_COLOR = '#323b4b'; // display until finishing apply stylesheet
const config = new Config();

const initialize = async () => {
  await config.initialize();
};

const onWindowMove = debounce(async () => {
  const [x, y] = window.getPosition();
  config.set({
    window_x: x,
    window_y: y
  });
  console.log('window move', x, y);
  await config.store();
}, 300);

const onWindowResize = debounce(async () => {
  const [width, height] = window.getSize();
  config.set({
    window_width: width,
    window_height: height
  });
  console.log('window resize', width, height);
  await config.store();
}, 300);

const onWindowClose = () => window = null;

const onReady = async () => {
  await initialize();

  window = new BrowserWindow({
    x: config.get('window_x'),
    y: config.get('window_y'),
    width: config.get('window_width'),
    height: config.get('window_height'),
    backgroundColor: INITIAL_BG_COLOR
  });

  window.on('move', onWindowMove);
  window.on('resize', onWindowResize);
  window.on('closed', onWindowClose);

  window.loadURL(INDEX_HTML);

  if (process.env.NODE_ENV === 'development') {
    (async () => {
      await require('./debug')();
    })();
  }

  app.focus();

  // TODO: DELETE
  // =====================================================
  window.openDevTools();
  // =====================================================

};

const onWindowAllClosed = () => {
  console.log('window all closed.');
  app.quit();
};

app.on('ready', onReady);
app.on('window-all-closed', onWindowAllClosed);
