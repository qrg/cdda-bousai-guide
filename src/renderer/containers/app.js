'use strict';

import {EventEmitter} from 'events';
import {ipcRenderer as ipc} from 'electron';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Inquirer from './inquirer';
import SearchBox from './search-box';
import Preferences from './preferences';

// Needed for onTouchTap / drag titlebar
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const PAGE_TRANSITION = {
  component: 'div',
  transitionName: 'page',
  transitionEnter: false,
  transitionLeaveTimeout: 600
};

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isInitializing: true
    };
    this.emitter = new EventEmitter();
  }

  componentDidMount() {
    this.emitter.on('init-done', () => this.onInitDone());
  }

  componentWillUnmount() {
    this.emitter.removeAllListeners('init-done');
  }

  render() {
    const props = {emitter: this.emitter};
    const {isInitializing} = this.state;

    return (
      <ReactCSSTransitionGroup {...PAGE_TRANSITION}>
        {isInitializing &&
        <Inquirer key='inquirer' {...props} />
        }
        {!isInitializing &&
        <SearchBox key='search-box' {...props}></SearchBox>
        }
        {!isInitializing &&
        <Preferences key='preferences' {...props}></Preferences>
        }
      </ReactCSSTransitionGroup>
    );
  }

  onInitDone() {
    this.setState({isInitializing: false});
  }

}
