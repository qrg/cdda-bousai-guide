'use strict';

import {EventEmitter} from 'events';
import React, {PropTypes} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import throttle from 'lodash.throttle';
import Title from '../components/title';
import ExePathField from '../components/exe-path-field';
import LangField from '../components/lang-field';
import ProgressBar from '../components/progress-bar';

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
      indicatorMessage: '',
      items: {
        inProgress: false,
        max: 0,
        value: 0,
        rate: 0
      },
      indexer: {
        inProgress: false,
        max: 0,
        value: 0,
        rate: 0
      }
    };

    this.config = new Map([
      ['exe_path', ''],
      ['lang', '']
    ]);
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
    };
  }

  componentWillMount() {
    ipc.on('main:reply-config-status', (...args) => this.onReplyConfigStatus(...args));
    ipc.on('main:info', (...args) => this.onInfo(...args));
    ipc.on('main:error', (...args) => this.onError(...args));
    ipc.on('main:items-build-start', (...args) => this.onItemsBuildStart(...args));
    ipc.on('main:items-build-progress',
      throttle((...args) => {
        return this.onItemsBuildProgress(...args);
      }, 500, {leading: false, trailing: true})
    );
    ipc.on('main:items-build-done', (...args) => this.onItemsBuildDone(...args));
    ipc.on('main:indexer-build-start', (...args) => this.onIndexerBuildStart(...args));
    ipc.on('main:indexer-build-progress',
      throttle((...args) => {
        return this.onIndexerBuildProgress(...args);
      }, 500, {leading: false, trailing: true})
    );
    ipc.on('main:indexer-build-done', (...args) => this.onIndexerBuildDone(...args));
    ipc.on('main:indexer-init-done', (...args) => this.onIndexerInitDone(...args));
    ipc.on('main:reply-exe-path-validation', (...args) => this.onReplyExePathValidation(...args));
    ipc.on('main:reply-lang-list', (...args) => this.onReplyLangList(...args));
    ipc.on('main:reply-save-config', (...args) => this.onReplySaveConfig(...args));
    this.props.emitter.on('app:request-open-dialog-exe-path', () => this.onRequestOpenDialogExePath());
    this.props.emitter.on('app:request-lang-list', () => this.onRequestLangList());
    this.props.emitter.on('app:inquiry-back', () => this.onInquiryBack());
    this.props.emitter.on('app:lang-selected', (...args) => this.onLangSelected(...args));
  }

  componentDidMount() {
    wait(1000).then(() => {
      ipc.send('main:request-config-status');
    });
  }

  componentWillUnmount() {
    ipc.removeAllListeners('main:reply-config-status');
    ipc.removeAllListeners('main:info');
    ipc.removeAllListeners('main:error');
    ipc.removeAllListeners('main:items-build-start');
    ipc.removeAllListeners('main:items-build-progress');
    ipc.removeAllListeners('main:items-build-done');
    ipc.removeAllListeners('main:indexer-build-start');
    ipc.removeAllListeners('main:indexer-build-progress');
    ipc.removeAllListeners('main:indexer-build-done');
    ipc.removeAllListeners('main:indexer-init-done');
    ipc.removeAllListeners('main:reply-exe-path-validation');
    ipc.removeAllListeners('main:reply-lang-list');
    ipc.removeAllListeners('main:reply-save-config');
    this.props.emitter.removeAllListeners('app:request-open-dialog-exe-path');
    this.props.emitter.removeAllListeners('app:request-lang-list');
    this.props.emitter.removeAllListeners('app:inquiry-back');
    this.props.emitter.removeAllListeners('app:lang-selected');
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

  requestInitItems() {
    wait(1000).then(() => {
      ipc.send('main:request-items-init');
    });
  }

  onInfo(event, ...args) {
    console.info(...args);
    this.setState({indicatorMessage: args.join('\n')});
  }

  onError(event, ...args) {
    console.error(...args);
    this.setState({indicatorMessage: args.join('\n')});
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
    this.requestInitItems();
  }

  onRequestLangList() {
    this.setStateDeep('langField', {isBusy: true});
    ipc.send('main:request-lang-list', this.config.get('exe_path'));
  }

  onLangSelected(selected) {
    this.config.set('lang', selected);
    ipc.send('main:request-save-config', [...this.config.values()]);
    this.setState({step: 1});
    this.requestInitItems();
  }

  onInquiryBack() {
    this.stepPrevious();
  }

  onItemsBuildStart() {
    wait(600).then(() => {
      this.setStateDeep('items', {inProgress: true});
    });
  }

  onItemsBuildProgress(event, err, state) {
    if (err) {
      console.error(err);
      return;
    }
    const {max, value, rate} = state;
    this.setStateDeep('items', {
      max: max,
      value: value,
      rate: rate
    });
  }

  onItemsBuildDone() {
    this.setStateDeep('items', {inProgress: false});
  }

  onIndexerBuildStart() {
    wait(600).then(() => {
      this.setStateDeep('indexer', {inProgress: true});
    });
  }

  onIndexerBuildProgress(event, err, state) {
    if (err) {
      console.error(err);
      return;
    }
    const {max, value, rate} = state;
    this.setStateDeep('indexer', {
      max: max,
      value: value,
      rate: rate
    });
  }

  onIndexerBuildDone() {
    wait(600).then(() => {
      this.setStateDeep('indexer', {inProgress: false});
    });
  }

  onIndexerInitDone() {
    wait(1000).then(() => {
      this.props.emitter.emit('init-done');
    });
  }

  renderIndicator() {
    const {items, indexer, indicatorMessage} = this.state;
    const transitions = {
      transitionName: 'progress',
      transitionAppear: true,
      transitionAppearTimeout: 600,
      transitionEnterTimeout: 600,
      transitionLeaveTimeout: 600
    };

    const renderProgressIfActive = () => {
      return [items, indexer]
        .filter(e => e.inProgress)
        .map((e, i) => {
          const {max, value, rate} = e;
          return (
            <ProgressBar
              max={max}
              value={value}
              rate={rate}
              key={i}
            ></ProgressBar>
          );
        });
    };

    return (
      <section className='init-indicator'>
        <p className='spinner has-text-center'>
          <span className='loader' aria-hidden={true}></span>
        </p>
        <ReactCSSTransitionGroup {...transitions}>
          {renderProgressIfActive()}
        </ReactCSSTransitionGroup>
        <p className='log'>{indicatorMessage}</p>

      </section>
    );
  }

  renderStep() {
    const transitions = {
      transitionName: 'step',
      transitionAppear: true,
      transitionAppearTimeout: 600,
      transitionEnterTimeout: 600,
      transitionLeaveTimeout: 600
    };

    switch (this.state.step) {
      case 1:
        return (
          <span>
            <div className='title-screen' key={this.state.step}>
              <Title />
              {this.renderIndicator()}
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
  }

  render() {
    return (
      <div className='inquirer'>
        <div className='inquirer-body'>
          <main className='content has-text-centered'>
            {this.renderStep()}
          </main>
        </div>
      </div>
    );
  }

}
