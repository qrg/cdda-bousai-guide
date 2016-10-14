'use strict';

import React, {Component, PropTypes} from 'react';
import {EventEmitter} from 'events';
import classNames from 'classnames';
import ErrorList from './error-list';

export default class ExePathField extends Component {

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
      errors: PropTypes.array.isRequired,
      isBusy: PropTypes.bool.isRequired
    };
  }

  onClick() {
    this.props.emitter.emit('app:request-open-dialog-exe-path');
  }

  render() {
    const btnClass = classNames({
      'button': true,
      'is-black': true,
      'is-large': true,
      'is-loading': this.props.isBusy,
      'is-disabled': this.props.isBusy
    });

    return (
      <div className='exe-path-field'>
        <h1>Select CDDA executable.</h1>
        <section>
          <p>
            <button onClick={this.onClick} className={btnClass}>
              <span className='icon'>
                <i className='fa fa-folder-open pull-left' aria-hidden={true}></i>
              </span>
              <span>Select</span>
            </button>
          </p>
          <div style={{minHeight: '4rem'}}>
            {this.props.errors.length >= 1 &&
            <ErrorList errors={this.props.errors} />}
          </div>
        </section>
        <section>
          <h2>Examples</h2>
          <ul className='help'>
            <li>cataclysmdda\0.C\cataclysm-tiles.exe</li>
            <li>~/Application/Cataclysm.app</li>
            <li>~/cataclysmdda/0.C/cataclysm-launcher</li>
          </ul>
        </section>
      </div>
    );
  }
}
