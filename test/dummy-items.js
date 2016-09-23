'use strict';

const dummyItems = [
  {
    type: 'COMESTIBLE',
    id: 'atomic_coffee',
    name: 'atomic coffee',
    name_plural: 'atomic coffee',
    weight: 257,
    color: 'brown',
    addiction_type: 'caffeine',
    use_action: 'ATOMIC_CAFF',
    stim: 25,
    container: 'bottle_plastic',
    comestible_type: 'DRINK',
    symbol: '~',
    quench: 40,
    healthy: -5,
    addiction_potential: 8,
    nutrition: 4,
    description: 'This serving of coffee has been created using an atomic coffee pot\'s FULL NUCLEAR brewing cycle.  Every possible microgram of caffeine and flavor has been carefully extracted for your enjoyment, using the power of the atom.',
    price: 300,
    volume: 1,
    phase: 'liquid',
    charges: 1,
    flags: [
      'EATEN_HOT'
    ],
    fun: 10,
    translations: [
      'アトミックコーヒー'
    ]
  },
  {
    type: 'GENERIC',
    id: 'atomic_coffeepot',
    category: 'tools',
    symbol: ',',
    color: 'light_green',
    name: 'atomic coffee maker',
    description: 'Never sacrifice taste for convenience, when you can have both with the Rivtech atomic coffee maker!  Its simple and robust atomic-age construction guarantees a service life of at least 160 million years.',
    price: 100000,
    material: [
      'plastic',
      'aluminum'
    ],
    flags: [
      'LEAK_DAM',
      'RADIOACTIVE',
      'DURABLE_MELEE'
    ],
    weight: 4102,
    volume: 3,
    bashing: 5,
    to_hit: -2,
    use_action: 'HOTPLATE',
    qualities: [
      [
        'BOIL',
        1
      ]
    ],
    translations: [
      'アトミックコーヒーメーカー'
    ]
  }
];

export default dummyItems;
