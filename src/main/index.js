'use strict';

import {app, BrowserWindow} from 'electron';

let window;

console.log('main file');

app.on('ready', () => {
  window = new BrowserWindow({
    width: 1280,
    height: 960
  });
  window.loadURL(`file://${__dirname}/../renderer/index.html`);

  if (process.env.NODE_ENV == 'development') {
    window.openDevTools();
  }

  window.on('closed', () => {
    window = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
