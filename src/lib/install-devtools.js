'use strict';

module.exports = () => {
  console.log('================================================================');
  console.log('Installing devtools.');
  console.log('================================================================');

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
