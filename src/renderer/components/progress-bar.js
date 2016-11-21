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
      rate: React.PropTypes.number.isRequired,
      classNames: React.PropTypes.string
    };
  }

  static get defaultProps() {
    return {
      classNames: 'progress is-small'
    };
  }

  render() {
    const {value, max, rate, classNames} = this.props;
    return (
    <div className='progress-bar'>
      <progress className={classNames} value={value} max={max}>
        <span>{rate} %</span>
      </progress>
      <p className='status has-text-centered'>{value}/{max}</p>
    </div>
    );
  }
}
