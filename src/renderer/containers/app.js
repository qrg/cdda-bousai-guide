'use strict';

import {EventEmitter} from 'events';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Inquirer from './inquirer';
import SearchBox from './search-box';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const transition = {
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
    this.emitter.on('init-done', () => this.onInitDone());
  }

  render() {
    return (
      <ReactCSSTransitionGroup {...transition}>
        {
          (this.state.isInitializing)
            ? <Inquirer key='inquirer' emitter={this.emitter} />
            : <SearchBox key='search-box' emitter={this.emitter}></SearchBox>
        }
      </ReactCSSTransitionGroup>
    );
  }

  onInitDone() {
    this.setState({isInitializing: false});
  }

}
