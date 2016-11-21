'use strict';

import {EventEmitter} from 'events';
import React, {PropTypes} from 'react';
import Mousetrap from 'mousetrap';

export default class SearchBar extends React.Component {

  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
      style: PropTypes.object
    };
  }

  componentDidMount() {
    const {input} = this.refs;
    Mousetrap(input).bind('enter', this.submit);
    Mousetrap().bind(['command+f', 'ctrl+f', '/'], this.focus);
    Mousetrap(input).bind('esc', this.blur);
  }

  componentWillUnmount() {
    const {input} = this.refs;
    Mousetrap(input).unbind('enter');
    Mousetrap().unbind(['command+f', 'ctrl+f', '/']);
    Mousetrap(input).unbind('esc');
  }

  submit() {
    const {value} = this.refs.input;
    this.props.emitter.emit('send-search-term', value);
  }

  focus(e) {
    e.preventDefault();
    this.refs.input.focus();
  }

  blur() {
    this.refs.input.blur();
  }

  onChange(event) {
    const term = event.target.value;
    this.submit(term);
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
        />
        <i className='fa fa-search'></i>
      </div>
    );
  }

}
