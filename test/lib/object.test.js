'use strict';

import test from 'ava';
import {getType, is, isPlainObject, filterObject} from '../../src/lib/object';

test('getType(arg) returns string as class name of a argument.', t => {
  t.is(getType('string'), 'String');
  t.is(getType(1), 'Number');
  t.is(getType([]), 'Array');
  t.is(getType({}), 'Object');
  t.is(getType(/regexp/g), 'RegExp');
  t.is(getType(true), 'Boolean');
  t.is(getType(false), 'Boolean');
  t.is(getType(null), 'Null');
  t.is(getType(undefined), 'Undefined');
  t.is(getType(NaN), 'Number');
});

test('is(type, obj) returns boolean as whether `obj` belong to `type`.', t => {
  t.true(is('String', 'string'));
  t.true(is('Number', 1));
  t.true(is('Array', []));
  t.true(is('Object', {}));
  t.true(is('RegExp', /regexp/g));
  t.true(is('Number', NaN));
  t.true(is('Boolean', true));
  t.true(is('Boolean', false));
});

test('is(type, obj) returns false if argument was `null` or `undefined`.', t => {
  t.false(is('Null', null));
  t.false(is('Undefined', undefined));
});

test('isPlainObject(arg) returns boolean as whether `arg` is associative array', t => {
  t.true(isPlainObject({}));
  t.false(isPlainObject('string'));
  t.false(isPlainObject(1));
  t.false(isPlainObject([]));
  t.false(isPlainObject(/regexp/g));
  t.false(isPlainObject(null));
  t.false(isPlainObject(true));
  t.false(isPlainObject(false));
  t.false(isPlainObject(undefined));
  t.false(isPlainObject(NaN));
});

test('filterObject(obj, condition) returns filtered object depends on condition', t => {
  const resultFilterObject = filterObject({
    a: 'a value',
    b: 1,
    c: 'c value',
    d: null
  }, (obj, key) => {
    return typeof obj[key] === 'number';
  });

  t.true(isPlainObject(resultFilterObject));
  t.is(Object.keys(resultFilterObject).length, 1);
});
