'use strict';

import test from 'ava';
import Tokenizer from '../../../src/main/tokenizers/tokenizer';

test('Tokenizer("ja") groups a word contains "&"', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = 'S&W';
  const expected = ['s&w'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("ja") splits numbers adjacent to alphabets"', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = '135gr';
  const expected = ['135', 'gr'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("ja") filters 1 character alphabet tokens', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = 'a b c d e f g h i j k l m n o p q r s t u v w x y z';
  const expected = [];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("ja") does not filter 1 digit number tokens', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = '4.6x30mm';
  const expected = ['4', '6', '30', 'mm'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("ja") convert to ngram except for alphanumeric symbols', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = '日本語です。Alphabets 123';
  const expected = ['日本', '本語', '語で', 'です', 'す', 'alphabets', '123'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("ja") should split tokens at stopwords', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = '本(学習)';
  const expected = ['本', '学習', '習'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('Tokenizer("ja") with searchMode should convert 1 char to a array includes 1 token', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = '刀';
  const expected = ['刀'];
  t.deepEqual(tokenizer.tokenize(text, {searchMode: true}), expected);
});

test('Tokenizer("ja") with searchMode should convert consecutive 2 chars to a array includes 1 token', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = '簡易';
  const expected = ['簡易'];
  t.deepEqual(tokenizer.tokenize(text, {searchMode: true}), expected);
});

test('Tokenizer("ja") with searchMode should convert the bigram\'s reminder char to a token combined with a last token\'s tail char', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = '簡易バール';
  const expected = ['簡易', 'ばー', 'ーる'];
  t.deepEqual(tokenizer.tokenize(text, {searchMode: true}), expected);
});

test('Tokenizer("ja") with searchMode should split tokens at stopwords', (t) => {
  const tokenizer = new Tokenizer('ja');
  const text = '本(学習)';
  const expected = ['本', '学習'];
  t.deepEqual(tokenizer.tokenize(text, {searchMode: true}), expected);
});
