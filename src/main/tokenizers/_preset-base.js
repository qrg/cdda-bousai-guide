
/*
 * 'ひらがな ｶﾀｶﾅ １２３ Ⅻ Ⅶ Ⅷ Ⅸ Ⅹ Ⅺ か\u3099 ① ！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝'.normalize('NFKC');
 * "ひらがな カタカナ 123 XII VII VIII IX X XI が 1 !"#$%&'()*+,-./:;<=>?@[\]^_`{|}"
 */
export function normalizeWithNFKC(str = '') {
  return str.normalize('NFKC');
}

export function toLowerCase(str = '') {
  return str.toLowerCase();
}

const base = {
  normalizers: [
    normalizeWithNFKC,
    toLowerCase
  ],
  tokenizePatterns: [
    /(\d+)/, // group
    /([!"$%'()*+,\-.\/:;<=>?@\[\\\]^_`|~·—‘’“”])/ // split
  ],
  ignorePatterns: [
    '',
    /^[a-zA-Z]$/,
    /^[!"$%&'()*+,\-.\/:;<=>?@\[\\\]^_`|~·—‘’“”]$/
  ],
  stemmer: false,
  ngram: false
};

export default base;
