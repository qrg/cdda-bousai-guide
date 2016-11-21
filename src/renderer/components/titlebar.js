'use strict';

import React, {PropTypes} from 'react';

export default class TitleBar extends React.Component {

  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      title: PropTypes.string,
      style: PropTypes.object,
      hasCloseButton: PropTypes.bool,
      onClickCloseButton: PropTypes.func
    };
  }

  static get defaultProps() {
    return {
      title: '',
      style: null,
      hasCloseButton: false,
      onClickCloseButton: () => {}
    };
  }

  render() {
    const {
      title,
      hasCloseButton, onClickCloseButton
    } = this.props;

    return (
      <header className='titlebar'>
        <div className="titlebar-body">
          {
            title !== '' &&
            <h1 className='title'>{title}</h1>
          }
          {
            hasCloseButton &&
            <button className='close' onClick={onClickCloseButton} role='button'>
              <i className="fa fa-close"></i>
            </button>
          }
        </div>
      </header>
    );
  }

}
