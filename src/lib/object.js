'use strict';

export function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

export function is(type, obj) {
  const klass = getType(obj);
  return obj !== undefined && obj !== null && klass === type;
}

export function isPlainObject(obj) {
  return is('Object', obj);
}
