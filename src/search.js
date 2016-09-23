'use strict';

const includes = (target, term) => {
  if (!term || !target) return false;
  if (Array.isArray(target)) {
    return target.some(v => {
      return v.includes(term);
    });
  }
  return target.includes(term);
};

export default function (term, items) {

  return items
    .filter(item => includes(item.name, term) || includes(item.translations, term))
    .sort((a, b) => {
      if (a.name === term) return -1;
      if (b.name === term) return 1;
      return 0;
    });

}
