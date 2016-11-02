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

import {isString} from '../../lib/string';

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

export default class Tokenizer {

  constructor(lang = 'en') {
    this.lang = lang;
    this.config = configMap[lang];
  }

  tokenize(text, options = {searchMode: false}) {
    const normalized = this.normalize(text);
    let result = this.split(normalized);

    if (this.config.stemmer) {
      result = result.map(token => this.config.stemmer(token));
    }

    if (this.config.ngram) {
      result = options.searchMode
        ? this.ngramizeSearchTerm(result)
        : this.ngramize(result);
    }

    return this.filterTokens(result);
  }

  normalize(str = '') {
    const replacers = this.config.normalizers;

    return replacers.reduce((prev, replacer) => {
      return replacer(prev);
    }, str);
  }

  split(str = '') {
    const patterns = this.config.tokenizePatterns;
    const spaceReplaced = str.replace(/\s+/g, '_');
    const patternReplaced = patterns.reduce((prev, pattern) => {
      return prev.replace(new RegExp(pattern, 'gim'), ' $1 ');
    }, spaceReplaced);

    return patternReplaced.trim().split(/\s+/);
  }

  filterTokens(tokens = []) {
    const patterns = this.config.ignorePatterns;
    return patterns.reduce((prev, pattern) => {
      return prev.filter(token => {
        if (isString(pattern)) {
          return pattern !== token;
        }
        return !(new RegExp(pattern, 'gim').test(token));
      });
    }, tokens);
  }

  ngramize(tokens = []) {
    const replaced = tokens.map(t => {
      if (this.isIgnorePattern(t)) return '';
      return t;
    });

    return replaced.reduce((prev, token, i) => {

      if (this.isIgnorePattern(token)) {
        return prev;
      }

      const wordPattern = /[a-zA-Z0-9]+/gi;
      const next = replaced[i + 1];

      if (
        !next // add a last token even if it was monogram
        || this.isIgnorePattern(next) // add a current token even if it was monogram
        || token.match(wordPattern) || next.match(wordPattern) // split a word made of english letters
      ) {
        return [...prev, token];
      }

      // add a bigram token
      return [...prev, `${token}${next}`];
    }, []);
  }

  ngramizeSearchTerm(tokens = []) {
    const replaced = tokens.map(t => {
      if (this.isIgnorePattern(t)) return '';
      return t;
    });

    const filtered = replaced.filter(t => t !== '');

    if (filtered.length <= 1) {
      return filtered;
    }

    const wordPattern = /[a-zA-Z0-9]+/gi;
    const isBlank = (token) => token === '';
    const isWord = (token) => {
      return (new RegExp(wordPattern, 'gi')).test(token);
    };
    const isNextEnd = (nextToken) => {
      return typeof nextToken === 'undefined';
    };
    const skipToken = (grams) => [grams, []];
    const addToken = (grams, token) => [[...grams, token], []];
    const stackToken = (grams, token) => [[...grams], [token]];
    const joinStack = (grams, token, stack) => {
      return [[...grams, stack[0] + token], []];
    };
    const joinLast = (grams, token, last) => {
      return [[...grams, last + token], []];
    };

    const reduced = replaced.reduce((accum, token, i, tokens) => {
      const [grams, stack] = accum;

      if (isBlank(token)) {
        return skipToken(grams);
      }
      if (isWord(token)) {
        return addToken(grams, token);
      }

      const next = tokens[i + 1];

      if (isBlank(next) || isWord(next) || isNextEnd(next)) {
        if (stack.length > 0) {
          return joinStack(grams, token, stack);
        }

        const prev = grams[grams.length - 1];

        if (isWord(prev)) {
          return addToken(grams, token);
        }

        const last = prev[prev.length - 1];
        return joinLast(grams, token, last);
      }

      if (stack.length >= 1) {
        return joinStack(grams, token, stack);
      }

      return stackToken(grams, token);
    }, [[], []]);

    return reduced[0];
  }

  isIgnorePattern(token) {
    const patterns = this.config.ignorePatterns;
    return patterns.some(p => {
      if (isString(p)) {
        return p === token;
      }
      return (new RegExp(p, 'gi').test(token));
    });
  }
}
