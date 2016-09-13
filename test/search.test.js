'use strict';

import test from 'ava';
import search from '../src/search';
import dictionary from './dummy-dictionary';

const SEARCH_TERM = 'アトミックコーヒー';
let results;

test.beforeEach(() => results = search(SEARCH_TERM, dictionary));

test('returns Array includes all of matched entries.', t => {
  t.true(Array.isArray(results));
  t.is(results.length, 4);
});

test('an exact matched is the first element of results.', t => {
  t.is(results[0]['msgstr'][0], SEARCH_TERM);
});
