'use strict';

import Tokenizer from './tokenizers/tokenizer';
import logger from './logger';
import {TfIdf} from 'natural';
import {isString} from '../lib/string';

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
  const base = prev.findIndex(e => e.id === posting.id);
  const dup = prev[base];

  if (base === -1) {
    return [...prev, posting];
  }

  dup.tokens = [...dup.tokens, ...posting.tokens];

  return prev;
}

export default function (term, items, index, config) {
  const start = process.hrtime();

  const lang = config.get('lang');
  const ignoreKeys = config.get('index_ignore_keys');
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
    .filter(p => {
      const keys = p.tokens.map(t => t.token);
      return tokens.every(t => keys.includes(t));
    });

  const isIgnoreKey = (key) => ignoreKeys.some(keyName => keyName === key);
  const isForScoring = (key, val) => isString(val) && !isIgnoreKey(key);
  const docs = matched.map(e => {
    const doc = e.ref;

    const text = Object.keys(doc).reduce((prev, key) => {
      if (key === 'translation') {
        const translation = doc[key];
        const t = Object.keys(translation).reduce((tPrev, tKey) => {
          if (isForScoring(tKey, translation[tKey])) {
            return [...tPrev, translation[tKey]];
          }
          return tPrev;
        }, []);
        return [...prev, ...t];
      }

      if (isForScoring(key, doc[key])) {
        return [...prev, doc[key]];
      }

      return prev;
    }, []).join(' ');

    return tokenize(text, lang);
  });

  const tfidf = new TfIdf();
  docs.forEach(d => tfidf.addDocument(d));

  tfidf.tfidfs(tokens, (i, score) => {
    matched[i].score = score;
  });

  const results = matched.sort((a, b) => {
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
