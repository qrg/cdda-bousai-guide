'use strict';

const includes = (target, term) => {
  if (Array.isArray(target)) {
    return target.some(str => str.includes(term));
  }
  return target.includes(term);
};

export default function (term, dictionary) {
  const matched = [...dictionary.values()].filter((v) => includes(v.msgstr, term));

  return matched.sort((a, b) => {
    if (a.msgstr.some(v => v === term)) return -1;
    if (b.msgstr.some(v => v === term)) return 1;
    return 0;
  });
}
