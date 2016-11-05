'use strict';

import React from 'react';

export default class ProgressBar extends React.Component {

  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      max: React.PropTypes.number.isRequired,
      value: React.PropTypes.number.isRequired,
      rate: React.PropTypes.number.isRequired
    };
  }

  render() {
    const {value, max, rate} = this.props;
    return (
    <div>
      <progress className='progress is-small' value={value} max={max}>
        <span>{rate} %</span>
      </progress>
      <p className='status has-text-centered'>{value}/{max}</p>
    </div>
    );
  }
}
