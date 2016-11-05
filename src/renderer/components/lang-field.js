'use strict';

import React, {Component, PropTypes} from 'react';
import {EventEmitter} from 'events';
import classNames from 'classnames';

export default class LangField extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onClickBack = this.onClickBack.bind(this);
    this.onClickNext = this.onClickNext.bind(this);
    this.selected = this.props.defaultValue;
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
      langs: PropTypes.array.isRequired,
      defaultValue: PropTypes.string.isRequired,
      isBusy: PropTypes.bool.isRequired
    };
  }

  componentDidMount() {
    if (this.props.langs.length === 0) {
      this.props.emitter.emit('request-lang-list');
    }
  }

  onChange(e) {
    this.selected = e.target.value;
  }

  onClickBack() {
    this.props.emitter.emit('inquiry-back');
  }

  onClickNext() {
    this.props.emitter.emit('lang-selected', this.selected);
  }

  render() {
    const controlClass = classNames({
      'control': true,
      'is-loading': this.props.isBusy || this.props.langs.length < 1
    });
    const selectClass = classNames({
      'select': true,
      'is-medium': true,
      'is-disabled': this.props.isBusy || this.props.langs.length < 1
    });
    const buttonClassDefault = {
      'button': true,
      'is-large': true,
      'is-outlined': true,
      'is-black': true
    };
    const backButtonClass = classNames(buttonClassDefault);
    const nextButtonClass = classNames({
      ...buttonClassDefault,
      'is-disabled': this.props.isBusy || this.props.langs.length < 1
    });
    const langOptions = this.props.langs.map((lang, i) => {
      return <option {...{key: i, value: lang}}>{lang}</option>;
    });

    if (langOptions.length === 0) {
      langOptions[0] = <option key='reading'>Reading...</option>;
    }

    return (
      <section className='lang-field'>

        <section className="section">
          <h1>Select Language.</h1>
          <p className={controlClass}>
            <span className={selectClass}>
              <select onChange={this.onChange} defaultValue={this.props.defaultValue}>
                {langOptions}
              </select>
            </span>
          </p>
        </section>

        <nav className='control is-grouped'>
          <p className='control'>
            <button onClick={this.onClickBack} className={backButtonClass}>
              <i className='fa fa-chevron-left fa-pull-left' aria-hidden={true}></i>
              <span>Back</span>
            </button>
          </p>

          <p className='control'>
            <button onClick={this.onClickNext} className={nextButtonClass}>
              <span>Next</span>
              <i className='fa fa-chevron-right fa-pull-right' aria-hidden={true}></i>
            </button>
          </p>
        </nav>

      </section>
    );
  }
}
