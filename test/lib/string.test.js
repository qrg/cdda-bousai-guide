'use strict';

import test from 'ava';
import {
  includes,
  camelToSnake
} from '../../src/lib/string';

test('includes(target, term) returns boolean whether target includes term string.', t => {
  t.true(includes('a', 'abc'));
  t.false(includes('d', 'abc'));
});

test('includes(target, term) search in Array and Object recursively.', t => {
  const target = {
    a: ['1', 2, {b: 'search term'}]
  };
  t.true(includes('search term', target));
});

test('camelToSnake(str) converts camel case to snake case', t => {
  const str = 'camelCase';
  t.true(camelToSnake(str) === 'camel_case');
});
