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

  if (process.env.NODE_ENV === 'development') {
    const installExtension = require('electron-devtools-installer').default;
    const {REACT_DEVELOPER_TOOLS, REACT_PERF} = require('electron-devtools-installer');

    require('devtron').install();

    Promise.all([
      installExtension(REACT_DEVELOPER_TOOLS),
      installExtension(REACT_PERF)
    ]).then(name => console.log(`Added Extension: ${name}`))
      .then(() => window.openDevTools())
      .catch(err => console.error('An error occurred: ', err));
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
