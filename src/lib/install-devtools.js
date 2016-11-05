'use strict';

import logger from '../main/logger';

module.exports = () => {
  logger.separator('log');
  logger.log('Installing devtools.');
  logger.separator('log');

  const {app} = require('electron');
  const installExtension = require('electron-devtools-installer');

  app.on('ready', () => {

    const {
      REACT_DEVELOPER_TOOLS,
      REACT_PERF
    } = installExtension;

    Promise.all([
      installExtension(REACT_DEVELOPER_TOOLS),
      installExtension(REACT_PERF)
    ]).then(name => console.log(`Added Extension: ${name}`))
      .catch(err => console.error('An error occurred: ', err));

    require('devtron').install();
  });
};
