'use strict';

import preset_de from './preset-de';
import preset_es_AR from './preset-es_AR';
import preset_es_ES from './preset-es_ES';
import preset_en from './preset-en';
import preset_fr from './preset-fr';
import preset_it_IT from './preset-it_IT';
import preset_ja from './preset-ja';
import preset_ko from './preset-ko';
import preset_pt_BR from './preset-pt_BR';
import preset_pt_PT from './preset-pt_PT';
import preset_ru from './preset-ru';
import preset_zh_CN from './preset-zh_CN';
import preset_zh_TW from './preset-zh_TW';

const configMap = {
  de: preset_de,
  es_AR: preset_es_AR,
  es_ES: preset_es_ES,
  en: preset_en,
  fr: preset_fr,
  it_IT: preset_it_IT,
  ja: preset_ja,
  ko: preset_ko,
  pt_BR: preset_pt_BR,
  pt_PT: preset_pt_PT,
  ru: preset_ru,
  zh_CN: preset_zh_CN,
  zh_TW: preset_zh_TW
};

function normalize(str = '', replacers = configMap.en.normalizers) {
  return replacers.reduce((prev, replacer) => {
    return replacer(prev);
  }, str);
}

function split(str = '', patterns = configMap.en.tokenizePatterns) {
  const replaced = patterns.reduce((prev, pattern) => {
    return prev.replace(new RegExp(pattern, 'gim'), ' $1 ');
  }, str);
  return replaced.split(/\s+/);
}

function filterTokens(tokens = [], patterns = configMap.en.ignorePatterns) {
  return patterns.reduce((prev, pattern) => {
    return prev.filter(token => {
      if (typeof pattern === 'string') {
        return pattern !== token;
      }
      return !(new RegExp(pattern, 'gim').test(token));
    });

  }, tokens);
}

function ngramize(tokens) {
  return tokens.map((token, i) => {
    const pattern = /[a-zA-Z0-9]+/gi;
    const next = tokens[i +1];
    if (!next) {
      return token;
    }
    if (token.match(pattern) || next.match(pattern)) {
      return token;
    }
    return `${token}${tokens[i + 1]}`;
  });
}

export default class Tokenizer {
  constructor(lang = 'en') {
    this.lang = lang;
    this.config = configMap[lang];
  }

  tokenize(text) {
    const normalized = normalize(text, this.config.normalizers);
    const tokens = split(normalized, this.config.tokenizePatterns);
    const filtered = filterTokens(tokens, this.config.ignorePatterns);
    const stemmed = filtered.map(token => {
      if (!this.config.stemmer) {
        return token;
      }
      return this.config.stemmer(token);
    });
    if (!this.config.ngram) {
      return stemmed;
    }
    return ngramize(stemmed);
  }
}
