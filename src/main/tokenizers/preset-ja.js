'use strict';

import base, {
  normalizeWithNFKC,
  toLowerCase
} from './_preset-base';

export function katakanaToHiragana(str = '') {
  const DISTANCE = 0x60;
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - DISTANCE;
    return String.fromCharCode(chr);
  });
}

export default {
  ...base,
  normalizers: [
    normalizeWithNFKC,
    katakanaToHiragana,
    toLowerCase
  ],
  tokenizePatterns: [
    ...base.tokenizePatterns,
    /([^a-zA-Z0-9&])/,
    /([、。〈〉《》【】「」｢｣])/
  ],
  ignorePatterns: [
    ...base.ignorePatterns,
    /^[、。〈〉《》【】「」｢｣]$/
  ],
  ngram: true
};
