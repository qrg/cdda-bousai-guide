'use strict';

import React, {PropTypes} from 'react';

export default class ErrorList extends React.Component {

  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      errors: PropTypes.array,
      classNames: PropTypes.string
    };
  }

  render() {
    const errors = this.props.errors.map((err, i) => <li key={i}>{err}</li>);
    return (
      <ul className={this.props.classNames}>
        {errors}
      </ul>
    );
  }
}
