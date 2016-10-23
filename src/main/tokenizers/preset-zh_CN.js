'use strict';

import base from './_preset-base';

export default {
  ...base,
  tokenizePatterns: [
    ...base.tokenizePatterns,
    /([^a-zA-Z0-9&])/g
  ],
  ignorePatterns: [
    ...base.ignorePatterns,
    /^[。、･]$/g
  ],
  ngram: true
};
