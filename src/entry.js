'use strict';

import items from './items';
import search from './search';

const term = process.argv[2];
const results = search(term, items);

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

print(results);
