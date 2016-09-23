'use strict';

import test from 'ava';
import search from '../src/search';
import items from './dummy-items';

test('Returns Array includes all of matched entries.', t => {
  const term = 'アトミックコーヒー';
  const results = search(term, items);
  t.true(Array.isArray(results));
  t.is(results.length, 2);
});

test('An exact matched is the first element of results.', t => {
  const term = 'アトミックコーヒー';
  const results = search(term, items);
  t.is(results[0]['translations'][0], term);
});

test('Returns empty array if there are nothing matched.', t => {
  const results = search('aaa', items);
  t.is(results.length, 0);
});
