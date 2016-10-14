'use strict';

import {EventEmitter} from 'events';
import React, {PropTypes} from 'react';
import ProgressBar from './progress-bar';

export default class InitIndicator extends React.Component {

  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
      max: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
      rate: PropTypes.number.isRequired
    };
  }

  render() {
    const {max, value, rate} = this.props;
    return (
      <section className='init-indicator'>
        <p className='has-text-center'>
          <span className='loader' aria-hidden={true}></span>
        </p>
        <ProgressBar
          max={max}
          value={value}
          rate={rate}
        ></ProgressBar>
        <p className='status has-text-centered'>{value}/{max} entries</p>
      </section>
    );
  }
}
