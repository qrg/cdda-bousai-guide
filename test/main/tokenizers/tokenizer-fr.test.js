'use strict';

import test from 'ava';
import Tokenizer from '../../../src/main/tokenizers/tokenizer';

test('Tokenizer("fr") groups a word contains "&"', (t) => {
  const tokenizer = new Tokenizer('fr');
  const text = 'S&W';
  const expected = ['s&w'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("fr") splits numbers adjacent to alphabets"', (t) => {
  const tokenizer = new Tokenizer('fr');
  const text = '135gr';
  const expected = ['135', 'gr'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("fr") filters 1 character alphabet tokens', (t) => {
  const tokenizer = new Tokenizer('fr');
  const text = 'a b c d e f g h i j k l m n o p q r s t u v w x y z' +
    ' ä â à é è ë ê ï î ö ô ù ü û œ ç';
  const expected = [];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("fr") does not filter 1 digit number tokens', (t) => {
  const tokenizer = new Tokenizer('fr');
  const text = '4.6x30mm';
  const expected = ['4', '6', '30', 'mm'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});
