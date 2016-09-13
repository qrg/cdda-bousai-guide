'use strict';

const dummyDictionary = (() => {
  const map = new Map();
  const translation = {
    '': {
      'msgid': '',
      'msgstr': [
        'Project-Id-Version: Cataclysm-DDA\nReport-Msgid-Bugs-To: \nPOT-Creation-Date: 2016-09-05 11:44+0300\nPO-Revision-Date: 2016-09-07 07:10+0000\nLast-Translator: Pigmentblue15\nLanguage-Team: Japanese (http://www.transifex.com/cataclysm-dda-translators/cataclysm-dda/language/ja/)\nLanguage: ja\nMIME-Version: 1.0\nContent-Type: text/plain; charset=UTF-8\nContent-Transfer-Encoding: 8bit\nPlural-Forms: nplurals=1; plural=0;\n'
      ]
    },
    'Coffee of The Future...  RIGHT NOW!  No one has really has the time to make great coffee, but now you don\'t have to!  Rivtech gives you inexhaustible ATOMIC power!  To make boiling hot coffee the MINUTE you want it!  Atomic Coffeemaker.': {
      'msgid': 'Coffee of The Future...  RIGHT NOW!  No one has really has the time to make great coffee, but now you don\'t have to!  Rivtech gives you inexhaustible ATOMIC power!  To make boiling hot coffee the MINUTE you want it!  Atomic Coffeemaker.',
      'msgstr': [
        '広告:コーヒーの進化...それは今だ！　美味しいコーヒーとは時間をかけて作る物でした。しかしその必要はありません！Rivtechは「原子力」を使います！熱いコーヒーを飲みたいと思った瞬間沸騰する、それがアトミックコーヒーメーカー！'
      ]
    },
    'This serving of coffee has been created using an atomic coffee pot\'s FULL NUCLEAR brewing cycle.  Every possible microgram of caffeine and flavor has been carefully extracted for your enjoyment, using the power of the atom.': {
      'msgid': 'This serving of coffee has been created using an atomic coffee pot\'s FULL NUCLEAR brewing cycle.  Every possible microgram of caffeine and flavor has been carefully extracted for your enjoyment, using the power of the atom.',
      'msgstr': [
        'このコーヒーはアトミックコーヒーポットの完全に核反応的な抽出サイクルを経て淹れられています。カフェインや風味の1マイクログラムに至るまで、原子の力によって注意深く引き出されています。'
      ]
    },
    'atomic coffee': {
      'msgid': 'atomic coffee',
      'msgid_plural': 'atomic coffee',
      'msgstr': [
        'アトミックコーヒー'
      ]
    },
    'atomic coffee maker': {
      'msgid': 'atomic coffee maker',
      'msgid_plural': 'atomic coffee makers',
      'msgstr': [
        'アトミックコーヒーメーカー'
      ]
    },
    'atomic energy drink': {
      'msgid': 'atomic energy drink',
      'msgid_plural': 'atomic energy drinks',
      'msgstr': [
        'アトミック栄養ドリンク'
      ]
    },
    'atomic lamp': {
      'msgid': 'atomic lamp',
      'msgid_plural': 'atomic lamps',
      'msgstr': [
        'アトミックランプ'
      ]
    }
  };

  Object.keys(translation).forEach(key => map.set(key, translation[key]));

  return map;
})();

export default dummyDictionary;
