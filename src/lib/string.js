'use strict';

import {is, isPlainObject} from './object';
import {isArray} from './array';

export function isString(obj) {
  return is('String', obj);
}

export function includes(term, target) {
  if (!term, !target) return false;
  if (!isString(target) && !isArray(target) && !isPlainObject(target)) {
    return false;
  }

  if (isString(target)) {
    return target.includes(term);
  }

  if (isPlainObject(target)) {
    return Object.keys(target).some(key => {
      return includes(term, target[key]);  // recursive
    });
  }

  return target.some(val => {
    return includes(term, val); // recursive
  });
}
