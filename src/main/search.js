'use strict';

import Tokenizer from './tokenizers/tokenizer';

function tokenize(term, lang) {
  const words = term.split(/\s+/);

  const wordsEn = words.filter(w => {
    // all characters in po file msgid
    const regex = /^[!\"#$%&'()*+,-./0-9:;=?@A-Z[\\\]^_`a-z{|}~°³ßäêñöü–…☃]+$/ig;
    return w.match(regex);
  }).join(' ');

  const wordsTr = words.filter(w => {
    return !wordsEn.includes(w);
  }).join(' ');

  const tokensEn = new Tokenizer('en').tokenize(wordsEn, {searchMode: true});
  const tokensTr = new Tokenizer(lang).tokenize(wordsTr, {searchMode: true});
  return [...new Set([...tokensEn, ...tokensTr])];
}

export default function (term, items, index, lang) {
  const start = process.hrtime();
  console.time('search-time');

  const tokens = tokenize(term, lang);
  const results = tokens
    .reduce((prev, token) => { // get indexes of each tokens
      const postingList = index.get(token);

      if (!postingList) {
        return prev;
      }

      const pl = postingList.map(p => {
        const copied = {...p};
        copied.tokens = [{
          token: token,
          keys: [...copied.keys]
        }];
        delete copied.keys;
        return copied;
      });

      return [...prev, ...pl];
    }, [])
    .reduce((prev, posting) => { // unify by id
      const base = prev.findIndex(e => e.id === posting.id);
      const dup = prev[base];

      if (base === -1) {
        return [...prev, posting];
      }

      dup.tokens = [...dup.tokens, ...posting.tokens];

      return prev;
    }, [])
    .filter(p => {
      const keys = p.tokens.map(t => t.token);
      return tokens.every(t => keys.includes(t));
    })
    .sort((a, b) => {
      if (a.tokens.length < b.tokens.length) return 1;
      if (a.tokens.length > b.tokens.length) return -1;
      return 0;
    });

  console.log('===============================================');
  console.log('search tokens: ', tokens);
  results.forEach(e => {
    const keys = e.tokens.map(t => t.token);
    console.log(keys, e.ref.translation.name);
  });

  console.timeEnd('search-time');
  const searchTimes = process.hrtime(start); // => [second, nano-second]
  const searchTimeMS = Math.round(searchTimes[1] / 1000000 * 1000) / 1000;
  console.log('results    : ', results.length);

  return {
    results: results,
    searchTime: searchTimeMS
  };
}
