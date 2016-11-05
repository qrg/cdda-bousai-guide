'use strict';

import {EventEmitter} from 'events';
import React, {PropTypes} from 'react';

const KEY_ENTER = 13;
const KEY_ESCAPE = 27;

export default class SearchBar extends React.Component {

  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
      style: PropTypes.object
    };
  }

  sendTerm(term) {
    this.props.emitter.emit('send-search-term', term);
  }

  onChange(event) {
    const term = event.target.value;
    this.sendTerm(term);
  }

  onKeyDown(e) {
    const key = e.which || e.keyCode;
    if (key === KEY_ENTER) {
      this.sendTerm(this.refs.input.value);
    }
    if (key === KEY_ESCAPE) {
      this.refs.input.blur();
    }
  }

  render() {
    const style = this.props.style || {};

    return (
      <div className='search-bar container' style={style}>
        <input
          ref='input'
          type='text'
          className='input'
          placeholder='Search'
          onChange={this.onChange.bind(this)}
          onKeyDown={this.onKeyDown.bind(this)}
        />
        <i className='fa fa-search'></i>
      </div>
    );
  }

}
