'use strict';

import {includes} from '../lib/string';

export default function (term, items) {

  return items
    .filter(item => includes(term, item))
    .sort((a, b) => {
      if (a.name === term || a.translation.name === term) return -1;
      if (b.name === term || b.translation.name === term) return 1;
      return 0;
    });

}
