'use strict';

import React, {Component, PropTypes} from 'react';
import {EventEmitter} from 'events';
import classNames from 'classnames';

export default class LangField extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.defaultValue
    };
    this.onChange = this.onChange.bind(this);
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter),
      exePath: PropTypes.string.isRequired,
      langs: PropTypes.array,
      defaultValue: PropTypes.string,
      isBusy: PropTypes.bool,
      size: PropTypes.string,
      onChange: PropTypes.func
    };
  }

  static get defaultProps() {
    return {
      emitter: new EventEmitter(),
      langs: [],
      defaultValue: 'en',
      isBusy: true,
      size: 'normal'
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({value: nextProps.defaultValue});
  }

  onChange(e) {
    const value = e.target.value;
    this.setState({value: value});
    this.props.onChange(value);
  }

  render() {
    const {langs, isBusy, size} = this.props;
    const {value} = this.state;

    const controlClass = classNames({
      'control': true,
      'is-loading': isBusy || langs.length < 1
    });

    const selectClass = classNames({
      'select': true,
      [`is-${size}`]: true,
      'is-disabled': isBusy || langs.length < 1
    });

    const langOptions = langs.map((lang, i) => {
      return <option {...{key: i, value: lang}}>{lang}</option>;
    });

    if (langOptions.length === 0) {
      langOptions[0] = <option key='reading'>Reading...</option>;
    }

    return (
      <section className='lang-field'>
        <p className={controlClass}>
            <span className={selectClass}>
              <select onChange={this.onChange} value={value}>
                {langOptions}
              </select>
            </span>
        </p>
      </section>
    );
  }
}
