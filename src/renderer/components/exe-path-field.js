'use strict';

import React, {Component, PropTypes} from 'react';
import {EventEmitter} from 'events';
import classNames from 'classnames';
import {remote} from 'electron';

const {dialog} = remote;
const TITLEBAR_HEIGHT = 42; // px

export default class ExePathField extends Component {

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter),
      isBusy: PropTypes.bool,
      onDialogOpen: PropTypes.func,
      onDialogCancel: PropTypes.func,
      onDialogSelect: PropTypes.func,
      buttonSize: PropTypes.string
    };
  }

  static get defaultProps() {
    return {
      emitter: new EventEmitter(),
      isBusy: false,
      onDialogOpen: () => {},
      onDialogCancel: () => {},
      onDialogSelect: () => {},
      buttonSize: 'normal'
    };
  }

  onClick() {
    const {onDialogOpen, onDialogCancel, onDialogSelect} = this.props;
    onDialogOpen();
    const win = remote.getCurrentWindow();
    win.setSheetOffset(TITLEBAR_HEIGHT);
    const options = {properties: ['openFile']};
    dialog.showOpenDialog(win, options, (paths) => {
      if (!paths) { // dialog is canceled
        onDialogCancel(paths);
        return;
      }

      onDialogSelect(paths);
    });
  }

  render() {
    const {isBusy, buttonSize} = this.props;
    const btnClass = classNames({
      'button': true,
      'is-black': true,
      'is-loading': isBusy,
      'is-disabled': isBusy,
      [`is-${buttonSize}`]: true
    });

    return (
      <div className='exe-path-field'>
        <button onClick={this.onClick} className={btnClass}>
          <i className='fa fa-folder-open pull-left' aria-hidden={true}></i>
          Select
        </button>
      </div>
    );
  }
}
