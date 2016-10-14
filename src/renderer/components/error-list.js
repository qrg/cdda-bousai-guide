'use strict';

import React from 'react';

export default class ErrorList extends React.Component {

  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      errors: React.PropTypes.array
    };
  }

  render() {
    const errors = this.props.errors.map((err, i) => <li key={i}>{err}</li>);
    return (
      <ul className='help is-danger'>
        {errors}
      </ul>
    );
  }
}
