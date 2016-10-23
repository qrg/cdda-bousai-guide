'use strict';

import test from 'ava';
import Tokenizer from '../../../src/main/tokenizers/tokenizer';

test('Tokenizer("it_IT") groups a word contains "&"', (t) => {
  const tokenizer = new Tokenizer('it_IT');
  const text = 'S&W';
  const expected = ['s&w'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("it_IT") splits numbers adjacent to alphabets"', (t) => {
  const tokenizer = new Tokenizer('it_IT');
  const text = '135gr';
  const expected = ['135', 'gr'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("it_IT") filters 1 character alphabet tokens', (t) => {
  const tokenizer = new Tokenizer('it_IT');
  const text = 'a b c d e f g h i j k l m n o p q r s t u v w x y z';
  const expected = [];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("it_IT") does not filter 1 digit number tokens', (t) => {
  const tokenizer = new Tokenizer('it_IT');
  const text = '4.6x30mm';
  const expected = ['4', '6', '30', 'mm'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});
