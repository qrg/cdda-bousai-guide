'use strict';

import Tokenizer from './tokenizers/tokenizer';
import logger from './logger';

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

function unifyById(prev, posting) {
  const dup = prev.find(e => e.id === posting.id);

  if (!dup) {
    posting._scores = [posting.score];
    return [...prev, posting];
  }

  dup.tokens = [...dup.tokens, ...posting.tokens];
  dup._scores = [...dup._scores, posting.score];

  return prev;
}

function hasStrictMatchedName(tokens, posting) {
  const {ref} = posting;
  return tokens.some(t => {
    const name = ref.name;
    const tName = ref.translation ? (ref.translation.name || '') : '';
    return t === name || t === tName;
  });
}

function hasPartialMatchedName(tokens, posting) {
  const {ref} = posting;
  return tokens.some(t => {
    const name = ref.name || '';
    const tName = ref.translation ? (ref.translation.name || '') : '';
    return name.includes(t) || tName.includes(t);
  });
}

export default function (term, items, index, config) {
  const start = process.hrtime();

  const lang = config.get('lang');
  const tokens = tokenize(term, lang);
  const matched = tokens
    .map(token => [token, index.get(token)])
    .filter(e => e[1])
    .map(e => {
      const token = e[0];
      const postingList = e[1];
      return postingList.map(posting => {
        const copied = {...posting};
        copied.tokens = [{
          token: token,
          keys: [...copied.keys]
        }];
        delete copied.keys;
        return copied;
      });
    })
    .reduce((prev, current) => [...prev, ...current], [])
    .reduce(unifyById, [])
    .map(p => {
      p.score = p._scores.reduce((t, v) => t + v) / p._scores.length;
      delete p._scores;
      return p;
    })
    .filter(p => {
      const keys = p.tokens.map(t => t.token);
      return tokens.every(t => keys.includes(t));
    });

  const results = matched.sort((a, b) => {
    if (hasStrictMatchedName(tokens, a)) return -1;
    if (hasStrictMatchedName(tokens, b)) return 1;
    if (hasPartialMatchedName(tokens, a)) return -1;
    if (hasPartialMatchedName(tokens, b)) return 1;
    if (a.score < b.score) return 1;
    if (a.score > b.score) return -1;
    return 0;
  });

  logger.separator();
  logger.debug('search tokens: ', tokens);
  results.forEach(e => {
    const keys = e.tokens.map(t => t.token);
    logger.debug(e.score, keys, e.ref.translation.name);
  });

  const searchTimes = process.hrtime(start); // => [second, nano-second]
  const searchTimeMS = Math.round(searchTimes[1] / 1000000 * 1000) / 1000;
  logger.debug('results    : ', results.length);
  logger.debug('search-time: ', searchTimeMS, 'ms');

  return {
    results: results,
    searchTime: searchTimeMS
  };
}
