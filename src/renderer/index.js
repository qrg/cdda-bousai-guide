'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Sample from './sample-component';

ReactDOM.render(
  <Sample initialCount={0} />,
  document.getElementById('main')
);
