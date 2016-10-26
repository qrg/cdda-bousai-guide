'use strict';

import {EventEmitter} from 'events';
import React, {PropTypes} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import throttle from 'lodash.throttle';
import Title from '../components/title';
import ExePathField from '../components/exe-path-field';
import LangField from '../components/lang-field';
import InitIndicator from '../components/init-indicator';

import {ipcRenderer as ipc, remote} from 'electron';
import wait from '../../lib/wait';

const {showOpenDialog} = remote.dialog;

export default class Inquirer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      exePathField: {
        errors: [],
        isBusy: false
      },
      langField: {
        langs: [],
        defaultValue: '',
        isBusy: true
      },
      indicatorMax: 0,
      indicatorValue: 0,
      indicatorRate: 0
    };

    this.config = new Map([
      ['exe_path', ''],
      ['lang', '']
    ]);

    ipc.on('main:reply-config-status', (...args) => this.onReplyConfigStatus(...args));
    ipc.on('main:items-init-progress',
      throttle((...args) => {
        return this.onItemsInitProgress(...args);
      }, 1000, {leading: false, trailing: true})
    );
    ipc.on('main:items-initialized', (...args) => this.onItemsInitialized(...args));
    ipc.on('main:reply-exe-path-validation', (...args) => this.onReplyExePathValidation(...args));
    ipc.on('main:reply-lang-list', (...args) => this.onReplyLangList(...args));
    ipc.on('main:reply-save-config', (...args) => this.onReplySaveConfig(...args));
    this.props.emitter.on('app:request-open-dialog-exe-path', () => this.onRequestOpenDialogExePath());
    this.props.emitter.on('app:request-lang-list', () => this.onRequestLangList());
    this.props.emitter.on('app:inquiry-back', () => this.onInquiryBack());
    this.props.emitter.on('app:lang-selected', (...args) => this.onLangSelected(...args));
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
    };
  }

  onItemsInitialized(event, err) {
    if (err) {
      console.error(err);
      return;
    }
    wait(2000).then(() => {
      this.props.emitter.emit('initialized');
    });
  }

  componentDidMount() {
    wait(1000).then(() => {
      ipc.send('main:request-config-status');
    });
  }

  stepNext() {
    this.setState({step: this.state.step + 1});
  }

  stepPrevious() {
    this.setState({step: this.state.step - 1});
  }

  onRequestOpenDialogExePath() {
    this.setStateDeep('exePathField', {isBusy: true});

    showOpenDialog({properties: ['openFile']}, (paths) => {
      if (!paths) { // dialog is canceled
        this.setStateDeep('exePathField', {isBusy: false});
        return;
      }
      if (paths.length >= 1) {
        this.setStateDeep('exePathField', {
          errors: [],
          isBusy: true
        });
        ipc.send('main:request-exe-path-validation', paths[0]);
        return;
      }
      this.setStateDeep('exePathField', {
        errors: ['Path is not correct.'],
        isBusy: false
      });
    });
  }

  setStateDeep(key, state) {
    this.setState({[key]: {...this.state[key], ...state}});
  }

  requestItemsInit() {
    wait(600).then(() => {
      ipc.send('main:request-items-init');
    });
  }

  onReplyExePathValidation(event, err, {errMsgs, exePath}) {
    if (err) {
      console.error(err);
      return;
    }
    this.setStateDeep('exePathField', {isBusy: false});
    if (errMsgs.length === 0) {
      this.config.set('exe_path', exePath);
      this.stepNext();
      return;
    }
    errMsgs.forEach(err => console.error(err));
    this.setStateDeep('exePathField', {errors: errMsgs});
  }

  onReplyLangList(event, err, {langs, defaultValue}) {
    if (err) {
      console.error(err);
      return;
    }
    this.setStateDeep('langField', {
      langs,
      defaultValue,
      isBusy: false
    });
  }

  onReplySaveConfig(event, err, {file, data}) {
    if (err) {
      console.error(err);
      return;
    }
    console.log(file, data);
  }

  onReplyConfigStatus(event, err, {isFulfilled}) {
    console.log('onReplyConfigStatus', isFulfilled);
    if (err) {
      console.error(err);
      return;
    }
    if (!isFulfilled) {
      this.setState({step: 2});
      return;
    }
    this.requestItemsInit();
  }

  onItemsInitProgress(event, err, state) {
    if (err) {
      console.error(err);
      return;
    }
    const {max, value, rate} = state;
    this.setState({
      indicatorMax: max,
      indicatorValue: value,
      indicatorRate: rate
    });
  }

  onRequestLangList() {
    this.setStateDeep('langField', {isBusy: true});
    ipc.send('main:request-lang-list', this.config.get('exe_path'));
  }

  onLangSelected(selected) {
    this.config.set('lang', selected);
    ipc.send('main:request-save-config', [...this.config.values()]);
    this.setState({step: 1});
    this.requestItemsInit();
  }

  onInquiryBack() {
    this.stepPrevious();
  }

  render() {
    const transitions = {
      transitionName: 'step',
      transitionAppear: true,
      transitionAppearTimeout: 600,
      transitionEnterTimeout: 600,
      transitionLeaveTimeout: 600
    };

    const step = (() => {
      switch (this.state.step) {
        case 1:
          return (
            <span>
              <div key={this.state.step}>
                <Title />
                <InitIndicator
                  emitter={this.props.emitter}
                  max={this.state.indicatorMax}
                  value={this.state.indicatorValue}
                  rate={this.state.indicatorRate}
                />
              </div>
            </span>
          );
        case 2:
          return (
            <ReactCSSTransitionGroup {...transitions}>
              <ExePathField
                key={this.state.step}
                emitter={this.props.emitter}
                {...this.state.exePathField}
              />
            </ReactCSSTransitionGroup>
          );
        case 3:
          return (
            <ReactCSSTransitionGroup {...transitions}>
              <LangField
                key={this.state.step}
                emitter={this.props.emitter}
                {...this.state.langField}
              />
            </ReactCSSTransitionGroup>
          );
      }
    })();

    return (
      <div className='inquirer'>
        <div className='inquirer-body'>
          <main className='content has-text-centered'>
            {step}
          </main>
        </div>
      </div>
    );
  }

}
