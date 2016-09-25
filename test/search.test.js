'use strict';

import test from 'ava';
import search from '../src/search';

const items = [
  {
    'addiction_potential': 8,
    'addiction_type': 'caffeine',
    'charges': 1,
    'color': 'brown',
    'comestible_type': 'DRINK',
    'container': 'bottle_plastic',
    'description': 'This serving of coffee has been created using an atomic coffee pot\'s FULL NUCLEAR brewing cycle.  Every possible microgram of caffeine and flavor has been carefully extracted for your enjoyment, using the power of the atom.',
    'flags': ['EATEN_HOT'],
    'fun': 10,
    'healthy': -5,
    'id': 'atomic_coffee',
    'name': 'atomic coffee',
    'name_plural': 'atomic coffee',
    'nutrition': 4,
    'phase': 'liquid',
    'price': 300,
    'quench': 40,
    'stim': 25,
    'symbol': '~',
    'translation': {
      'addiction_type': 'カフェイン',
      'color': '茶色',
      'description': 'このコーヒーはアトミックコーヒーポットの完全に核反応的な抽出サイクルを経て淹れられています。カフェインや風味の1マイクログラムに至るまで、原子の力によって注意深く引き出されています。',
      'name': 'アトミックコーヒー',
      'name_plural': 'アトミックコーヒー'
    },
    'type': 'COMESTIBLE',
    'use_action': 'ATOMIC_CAFF',
    'volume': 1,
    'weight': 257
  },
  {
    'bashing': 5,
    'category': 'tools',
    'color': 'light_green',
    'description': 'Never sacrifice taste for convenience, when you can have both with the Rivtech atomic coffee maker!  Its simple and robust atomic-age construction guarantees a service life of at least 160 million years.',
    'flags': ['LEAK_DAM', 'RADIOACTIVE', 'DURABLE_MELEE'],
    'id': 'atomic_coffeepot',
    'material': ['plastic', 'aluminum'],
    'name': 'atomic coffee maker',
    'price': 100000,
    'qualities': [['BOIL', 1]],
    'symbol': ',',
    'to_hit': -2,
    'translation': {'name': 'アトミックコーヒーメーカー'},
    'type': 'GENERIC',
    'use_action': 'HOTPLATE',
    'volume': 3,
    'weight': 4102
  },
];

test('returns Array includes all of matched entries.', t => {
  const term = 'アトミックコーヒー';
  const results = search(term, items);
  t.true(Array.isArray(results));
  t.is(results.length, 2);
});

test('an exact matched is the first element of results.', t => {
  const term = 'アトミックコーヒー';
  const results = search(term, items);
  t.is(results[0]['translation']['name'], term);
});

test('returns empty array if there are nothing matched.', t => {
  const results = search('aaa', items);
  t.is(results.length, 0);
});
