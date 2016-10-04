'use strict';

import test from 'ava';
import {inherit} from '../src/main/items';

const origin = {
  'ammo_type': 'shot',
  'casing': 'shot_hull',
  'color': 'red',
  'count': 20,
  'damage': 50,
  'description': 'A shell filled with iron pellets.  Extremely damaging, plus the spread makes it very accurate at short range.  Favored by SWAT forces.',
  'effects': ['COOKOFF', 'SHOT'],
  'id': 'shot_00',
  'loudness': 160,
  'material': ['plastic', 'powder'],
  'name': '00 shot',
  'name_plural': '00 shot',
  'price': 3500,
  'range': 6,
  'recoil': 2500,
  'stack_size': 20,
  'symbol': '=',
  'type': 'AMMO',
  'volume': 1,
  'weight': 32
};

const base = {
  'copy-from': 'shot_00',
  'delete': {'effects': ['SHOT']},
  'description': 'A heavy metal slug used with shotguns to give them the range capabilities of a rifle.  Extremely damaging but rather inaccurate.',
  'id': 'shot_slug',
  'name': 'shotgun slug',
  'price': 4500,
  'proportional': {'damage': 0.65, 'dispersion': 1.3},
  'relative': {'pierce': 8, 'range': 6},
  'type': 'AMMO'
};

const sub = {
  'copy-from': 'shot_slug',
  'delete': {'effects': ['NEVER_MISFIRES']},
  'extend': {'effects': ['RECYCLED']},
  'id': 'reloaded_shot_slug',
  'name': 'reloaded shotgun slug',
  'name_plural': 'reloaded shotgun slug',
  'proportional': {'damage': 0.9, 'dispersion': 1.1, 'price': 0.7},
  'type': 'AMMO'
};

const items = [origin, base, sub];

test('inherit() should returns object that sub override base', (t) => {
  const result = inherit(base, sub, items);
  t.true(['id', 'name', 'name_plural'].every(k => result[k] === sub[k]));
});

test('inherit() should returns object has keys which sub does not have but base has', (t) => {
  const result = inherit(base, sub, items);
  const inheritedBase = inherit(origin, base, items);
  t.true([
    'description', 'weight', 'volume', 'material', 'symbol', 'color', 'count',
    'stack_size', 'ammo_type', 'casing', 'range', 'recoil', 'loudness', 'pierce',
  ].every(key => result[key] === inheritedBase[key]));
});

test('inherit() should returns object that numeric values are specified `relative` to base', (t) => {
  const result = inherit(origin, base, items);
  t.is(result.range, 12);
  t.is(result.pierce, 8);
});

test('inherit() should returns object that numeric values are specified `proportional` to base', (t) => {
  const result = inherit(base, sub, items);
  t.is(result.price, 3150);
  t.is(result.damage, 28);
  t.is(result.dispersion, 0);
});

test('inherit() should returns object which has added values via `extend` key', (t) => {
  const result = inherit(base, sub, items);
  t.deepEqual(result.effects, ['COOKOFF', 'RECYCLED']);
});

test('inherit() should returns object which has deleted values via `delete` key', (t) => {
  const result = inherit(origin, base, items);
  t.true(!result.effects.includes('SHOT'));
});
