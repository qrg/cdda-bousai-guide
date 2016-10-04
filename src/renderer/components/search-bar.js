'use strict';

import React from 'react';

const KEY_ENTER = 13;
const KEY_ESCAPE = 27;

class SearchBar extends React.Component {

  constructor(props) {
    super(props);
    console.log(props);
    this.state = {searchTerm: ''};
  }

  onChange(event) {
    console.log(event.target.value);
    this.setState({
      searchTerm: event.target.value
    });
  }

  onKeyDown(e) {
    const key = e.which || e.keyCode;
    if (key === KEY_ENTER) {
      console.log('searchTerm: ', this.state.searchTerm);
    }
    if (key === KEY_ESCAPE) {
      this.refs.input.blur();
    }
  }

  render() {
    return (
      <div className='SearchBar'>
        <input
          ref='input'
          type='text'
          className='input'
          onChange={this.onChange.bind(this)}
          onKeyDown={this.onKeyDown.bind(this)}
        />
      </div>
    );
  }

}

export default SearchBar;
