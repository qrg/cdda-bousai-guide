'use strict';

export default async function () {
  const installExtension = require('electron-devtools-installer').default;
  const {REACT_DEVELOPER_TOOLS, REACT_PERF} = require('electron-devtools-installer');

  require('devtron').install();

  await Promise.all([
    installExtension(REACT_DEVELOPER_TOOLS),
    installExtension(REACT_PERF)
  ]).then(name => console.log(`Added Extension: ${name}`))
    .then(() => window.openDevTools())
    .catch(err => console.error('An error occurred: ', err));
}
