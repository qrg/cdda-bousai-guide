'use strict';

export default function wait(num) {
  return new Promise(done => {
    const id = setTimeout(() => done(id), num);
  }).then(id => clearTimeout(id));
}
