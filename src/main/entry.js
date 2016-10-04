'use strict';

import search from './search';
import App from './app';

const term = process.argv[2];
const app = new App();
const print = (results) => {
  if (results.length === 0) {
    console.log('Nothing matched.');
    return;
  }
  const SEP = '-------------------------------------------------------------------------------';
  results.forEach(val => {
    console.log(SEP);
    console.log(val);
  });
  console.log(SEP);
};

app.initialize().then(() => {
  console.log('Successfully initialized.');
  console.log('Searching items...');
  console.time('search-time');
  const results = search(term, app.items.getAll());
  console.timeEnd('search-time');
  print(results);
});
