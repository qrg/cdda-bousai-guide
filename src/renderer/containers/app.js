'use strict';

import {EventEmitter} from 'events';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Inquirer from './inquirer';

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
    this.emitter.on('initialized', () => this.onInitialized());
  }

  render() {
    return (
      <ReactCSSTransitionGroup {...transition}>
        {
          (this.state.isInitializing)
            ? <Inquirer key='inquirer' emitter={this.emitter} />
            : <main>hi.</main>
        }
      </ReactCSSTransitionGroup>
    );
  }

  onInitialized() {
    this.setState({isInitializing: false});
  }

}
