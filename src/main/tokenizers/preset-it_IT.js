'use strict';

// import partially
// log4js required by natural causes build error on webpack
// https://github.com/nomiddlename/log4js-node/issues/391
import PorterStemmerIt from '../../../node_modules/natural/lib/natural/stemmers/porter_stemmer_it';
import base from './_preset-base';

const stopwords = [
  'a', 'abbastanza', 'abbia', 'abbiamo', 'abbiano', 'abbiate', 'accidenti',
  'ad', 'adesso', 'affinche', 'agl', 'agli', 'ahime', 'ahimÃ¨', 'ai', 'al',
  'alcuna', 'alcuni', 'alcuno', 'all', 'alla', 'alle', 'allo', 'allora',
  'altri', 'altrimenti', 'altro', 'altrove', 'altrui', 'anche', 'ancora',
  'anni', 'anno', 'ansa', 'anticipo', 'assai', 'attesa', 'attraverso', 'avanti',
  'avemmo', 'avendo', 'avente', 'aver', 'avere', 'averlo', 'avesse', 'avessero',
  'avessi', 'avessimo', 'aveste', 'avesti', 'avete', 'aveva', 'avevamo',
  'avevano', 'avevate', 'avevi', 'avevo', 'avrai', 'avranno', 'avrebbe',
  'avrebbero', 'avrei', 'avremmo', 'avremo', 'avreste', 'avresti', 'avrete',
  'avrà', 'avrò', 'avuta', 'avute', 'avuti', 'avuto', 'basta', 'bene',
  'benissimo', 'berlusconi', 'brava', 'bravo', 'c', 'casa', 'caso', 'cento',
  'certa', 'certe', 'certi', 'certo', 'che', 'chi', 'chicchessia', 'chiunque',
  'ci', 'ciascuna', 'ciascuno', 'cima', 'cio', 'cioe', 'cioÃ¨', 'circa',
  'citta', 'cittÃ', 'ciÃ²', 'co', 'codesta', 'codesti', 'codesto', 'cogli',
  'coi', 'col', 'colei', 'coll', 'coloro', 'colui', 'come', 'cominci',
  'comunque', 'con', 'concernente', 'conciliarsi', 'conclusione', 'consiglio',
  'contro', 'cortesia', 'cos', 'cosa', 'cosi', 'cosÃ¬', 'cui', 'd', 'da',
  'dagl', 'dagli', 'dai', 'dal', 'dall', 'dalla', 'dalle', 'dallo',
  'dappertutto', 'davanti', 'degl', 'degli', 'dei', 'del', 'dell', 'della',
  'delle', 'dello', 'dentro', 'detto', 'deve', 'di', 'dice', 'dietro', 'dire',
  'dirimpetto', 'diventa', 'diventare', 'diventato', 'dopo', 'dov', 'dove',
  'dovra', 'dovrÃ', 'dovunque', 'due', 'dunque', 'durante', 'e', 'ebbe',
  'ebbero', 'ebbi', 'ecc', 'ecco', 'ed', 'effettivamente', 'egli', 'ella',
  'entrambi', 'eppure', 'era', 'erano', 'eravamo', 'eravate', 'eri', 'ero',
  'esempio', 'esse', 'essendo', 'esser', 'essere', 'essi', 'ex', 'fa', 'faccia',
  'facciamo', 'facciano', 'facciate', 'faccio', 'facemmo', 'facendo', 'facesse',
  'facessero', 'facessi', 'facessimo', 'faceste', 'facesti', 'faceva',
  'facevamo', 'facevano', 'facevate', 'facevi', 'facevo', 'fai', 'fanno',
  'farai', 'faranno', 'fare', 'farebbe', 'farebbero', 'farei', 'faremmo',
  'faremo', 'fareste', 'faresti', 'farete', 'farà', 'farò', 'fatto', 'favore',
  'fece', 'fecero', 'feci', 'fin', 'finalmente', 'finche', 'fine', 'fino',
  'forse', 'forza', 'fosse', 'fossero', 'fossi', 'fossimo', 'foste', 'fosti',
  'fra', 'frattempo', 'fu', 'fui', 'fummo', 'fuori', 'furono', 'futuro',
  'generale', 'gia', 'giacche', 'giorni', 'giorno', 'giÃ', 'gli', 'gliela',
  'gliele', 'glieli', 'glielo', 'gliene', 'governo', 'grande', 'grazie',
  'gruppo', 'ha', 'haha', 'hai', 'hanno', 'ho', 'i', 'ieri', 'il', 'improvviso',
  'in', 'inc', 'infatti', 'inoltre', 'insieme', 'intanto', 'intorno', 'invece',
  'io', 'l', 'la', 'lasciato', 'lato', 'lavoro', 'le', 'lei', 'li', 'lo',
  'lontano', 'loro', 'lui', 'lungo', 'luogo', 'lÃ', 'ma', 'macche', 'magari',
  'maggior', 'mai', 'male', 'malgrado', 'malissimo', 'mancanza', 'marche', 'me',
  'medesimo', 'mediante', 'meglio', 'meno', 'mentre', 'mesi', 'mezzo', 'mi',
  'mia', 'mie', 'miei', 'mila', 'miliardi', 'milioni', 'minimi', 'ministro',
  'mio', 'modo', 'molti', 'moltissimo', 'molto', 'momento', 'mondo', 'mosto',
  'nazionale', 'ne', 'negl', 'negli', 'nei', 'nel', 'nell', 'nella', 'nelle',
  'nello', 'nemmeno', 'neppure', 'nessun', 'nessuna', 'nessuno', 'niente', 'no',
  'noi', 'non', 'nondimeno', 'nonostante', 'nonsia', 'nostra', 'nostre',
  'nostri', 'nostro', 'novanta', 'nove', 'nulla', 'nuovo', 'o', 'od', 'oggi',
  'ogni', 'ognuna', 'ognuno', 'oltre', 'oppure', 'ora', 'ore', 'osi', 'ossia',
  'ottanta', 'otto', 'paese', 'parecchi', 'parecchie', 'parecchio', 'parte',
  'partendo', 'peccato', 'peggio', 'per', 'perche', 'perchÃ¨', 'perché',
  'percio', 'perciÃ²', 'perfino', 'pero', 'persino', 'persone', 'perÃ²',
  'piedi', 'pieno', 'piglia', 'piu', 'piuttosto', 'piÃ¹', 'più', 'po',
  'pochissimo', 'poco', 'poi', 'poiche', 'possa', 'possedere', 'posteriore',
  'posto', 'potrebbe', 'preferibilmente', 'presa', 'press', 'prima', 'primo',
  'principalmente', 'probabilmente', 'proprio', 'puo', 'pure', 'purtroppo',
  'puÃ²', 'qualche', 'qualcosa', 'qualcuna', 'qualcuno', 'quale', 'quali',
  'qualunque', 'quando', 'quanta', 'quante', 'quanti', 'quanto', 'quantunque',
  'quasi', 'quattro', 'quel', 'quella', 'quelle', 'quelli', 'quello', 'quest',
  'questa', 'queste', 'questi', 'questo', 'qui', 'quindi', 'realmente',
  'recente', 'recentemente', 'registrazione', 'relativo', 'riecco', 'salvo',
  'sara', 'sarai', 'saranno', 'sarebbe', 'sarebbero', 'sarei', 'saremmo',
  'saremo', 'sareste', 'saresti', 'sarete', 'sarÃ', 'sarà', 'sarò', 'scola',
  'scopo', 'scorso', 'se', 'secondo', 'seguente', 'seguito', 'sei', 'sembra',
  'sembrare', 'sembrato', 'sembri', 'sempre', 'senza', 'sette', 'si', 'sia',
  'siamo', 'siano', 'siate', 'siete', 'sig', 'solito', 'solo', 'soltanto',
  'sono', 'sopra', 'sotto', 'spesso', 'srl', 'sta', 'stai', 'stando', 'stanno',
  'starai', 'staranno', 'starebbe', 'starebbero', 'starei', 'staremmo',
  'staremo', 'stareste', 'staresti', 'starete', 'starà', 'starò', 'stata',
  'state', 'stati', 'stato', 'stava', 'stavamo', 'stavano', 'stavate', 'stavi',
  'stavo', 'stemmo', 'stessa', 'stesse', 'stessero', 'stessi', 'stessimo',
  'stesso', 'steste', 'stesti', 'stette', 'stettero', 'stetti', 'stia',
  'stiamo', 'stiano', 'stiate', 'sto', 'su', 'sua', 'subito', 'successivamente',
  'successivo', 'sue', 'sugl', 'sugli', 'sui', 'sul', 'sull', 'sulla', 'sulle',
  'sullo', 'suo', 'suoi', 'tale', 'tali', 'talvolta', 'tanto', 'te', 'tempo',
  'ti', 'titolo', 'torino', 'tra', 'tranne', 'tre', 'trenta', 'troppo',
  'trovato', 'tu', 'tua', 'tue', 'tuo', 'tuoi', 'tutta', 'tuttavia', 'tutte',
  'tutti', 'tutto', 'uguali', 'ulteriore', 'ultimo', 'un', 'una', 'uno', 'uomo',
  'va', 'vale', 'vari', 'varia', 'varie', 'vario', 'verso', 'vi', 'via',
  'vicino', 'visto', 'vita', 'voi', 'volta', 'volte', 'vostra', 'vostre',
  'vostri', 'vostro', 'Ã¨', 'è'
];

export default {
  ...base,
  tokenizePatterns: [
    ...base.tokenizePatterns,
    /([^àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚa-zA-Z0-9&])/, // group
  ],
  ignorePatterns: [
    ...base.ignorePatterns,
    /^[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]$/,
    ...stopwords
  ],
  stemmer: PorterStemmerIt.stem
};
