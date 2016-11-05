'use strict';

import EventEmitter from 'events';
import {gray, green, cyan, red, bgRed} from 'chalk';

const COLOR_MAP = {
  debug: gray,
  log: green,
  info: cyan,
  error: red
};

const LEVELS = [
  'debug', 'log', 'info', 'error'
];

class Logger extends EventEmitter {

  constructor(options = {logLevel: 'log'}) {
    super();
    this.level = options.logLevel;
    this.levels = LEVELS.slice(LEVELS.indexOf(this.level));
  }

  debug(...args) {
    this.emit('debug', ...args);
    if (this.levels.includes('debug')) {
      console.log(gray('debug:'), ...args.map(s => gray(s)));
    }
  }

  log(...args) {
    this.emit('log', ...args);
    if (this.levels.includes('log')) {
      console.log(green('log  :'), ...args.map(s => green(s)));
    }
  }

  info(...args) {
    this.emit('info', ...args);
    if (this.levels.includes('info')) {
      console.info(cyan('info :'), ...args.map(s => cyan(s)));
    }
  }

  error(...args) {
    const err = args[0];
    this.emit('error', ...args);

    if (this.levels.includes('error')) {
      if (!(err instanceof Error)) {
        console.error(bgRed('error:'), ...args.map(s => red(s)));
        return;
      }

      console.error(bgRed('error:'), red(err.stack));

      args.shift();

      if (args.length > 0) {
        console.error(bgRed('error:'), ...args.map(s => red(s)));
      }
    }
  }

  separator(level = 'log') {
    if (this.levels.includes(level)) {
      const length = 80;
      const s = Array.from(new Array(length).keys()).map(() => '=').join('');

      console.log(COLOR_MAP[level](s));
    }
  }

}

const logger = new Logger();
export default logger;
