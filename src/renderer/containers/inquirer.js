'use strict';

import {EventEmitter} from 'events';
import {ipcRenderer as ipc} from 'electron';
import React, {PropTypes} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classNames from 'classnames';
import throttle from 'lodash.throttle';
import TitleBar from '../components/titlebar';
import Title from '../components/title';
import ExePathField from '../components/exe-path-field';
import LangField from '../components/lang-field';
import BuildIndicator from '../components/build-indicator';
import ErrorList from '../components/error-list';
import wait from '../../lib/wait';

const THROTTLE_WAIT = 300;
const THROTTLE_OPTIONS = {leading: true, trailing: true};

const STEP_TRANSITIONS = {
  component: 'div',
  transitionName: 'step',
  transitionEnterTimeout: 600,
  transitionLeaveTimeout: 600
};

export default class Inquirer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      indicatorMessage: '',
      exePathFieldIsBusy: false,
      exePathErrors: [],
      langs: [],
      langsDefaultValue: '',
      langFieldIsBusy: true,
      isItemsInProgress: false,
      itemsMax: 0,
      itemsValue: 0,
      isIndexerInProgress: false,
      indexerMax: 0,
      indexerValue: 0
    };

    this.config = {
      exePath: '',
      lang: ''
    };

    this.onReplyConfigStatus = this.onReplyConfigStatus.bind(this);
    this.onInfo = this.onInfo.bind(this);
    this.onError = this.onError.bind(this);
    this.onClickBack = this.onClickBack.bind(this);
    this.onClickNext = this.onClickNext.bind(this);
    this.onClickLast = this.onClickLast.bind(this);
    this.onReplyExePathValidation = this.onReplyExePathValidation.bind(this);
    this.onExePathSelect = this.onExePathSelect.bind(this);
    this.onReplyLangList = this.onReplyLangList.bind(this);
    this.onLangChange = this.onLangChange.bind(this);
    this.onItemsBuildStart = this.onItemsBuildStart.bind(this);
    this.onItemsBuildProgress = this.onItemsBuildProgress.bind(this);
    this.onItemsBuildDone = this.onItemsBuildDone.bind(this);
    this.onIndexerBuildStart = this.onIndexerBuildStart.bind(this);
    this.onIndexerBuildProgress = this.onIndexerBuildProgress.bind(this);
    this.onIndexerBuildDone = this.onIndexerBuildDone.bind(this);
    this.onIndexerInitDone = this.onIndexerInitDone.bind(this);
    this.onReplySaveConfig = this.onReplySaveConfig.bind(this);
    this.onInquiryBack = this.onInquiryBack.bind(this);

    this.throttledItemsBuildProgress = throttle(
      this.onItemsBuildProgress, THROTTLE_WAIT, THROTTLE_OPTIONS
    );
    this.throttledIndexerBuildProgress = throttle(
      this.onIndexerBuildProgress, THROTTLE_WAIT, THROTTLE_OPTIONS
    );

  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
    };
  }

  componentDidMount() {
    ipc.on('reply-config-status', this.onReplyConfigStatus);
    ipc.on('info', this.onInfo);
    ipc.on('error', this.onError);
    ipc.on('reply-exe-path-validation', this.onReplyExePathValidation);
    ipc.on('reply-lang-list', this.onReplyLangList);
    ipc.on('items-build-start', this.onItemsBuildStart);
    ipc.on('items-build-progress', this.throttledItemsBuildProgress);
    ipc.on('items-build-done', this.onItemsBuildDone);
    ipc.on('indexer-build-start', this.onIndexerBuildStart);
    ipc.on('indexer-build-progress', this.throttledIndexerBuildProgress);
    ipc.on('indexer-build-done', this.onIndexerBuildDone);
    ipc.on('indexer-init-done', this.onIndexerInitDone);
    ipc.on('reply-save-config', this.onReplySaveConfig);
    this.props.emitter.on('inquiry-back', this.onInquiryBack);

    wait(1000).then(() => {
      ipc.send('request-config-status');
    });
  }

  componentWillUnmount() {
    ipc.removeListener('reply-config-status', this.onReplyConfigStatus);
    ipc.removeListener('info', this.onInfo);
    ipc.removeListener('error', this.onError);
    ipc.removeListener('reply-exe-path-validation', this.onReplyExePathValidation);
    ipc.removeListener('reply-lang-list', this.onReplyLangList);
    ipc.removeListener('items-build-start', this.onItemsBuildStart);
    ipc.removeListener('items-build-progress', this.throttledItemsBuildProgress);
    ipc.removeListener('items-build-done', this.onItemsBuildDone);
    ipc.removeListener('indexer-build-start', this.onIndexerBuildStart);
    ipc.removeListener('indexer-build-progress', this.throttledIndexerBuildProgress);
    ipc.removeListener('indexer-build-done', this.onIndexerBuildDone);
    ipc.removeListener('indexer-init-done', this.onIndexerInitDone);
    ipc.removeListener('reply-save-config', this.onReplySaveConfig);
    this.props.emitter.removeListener('inquiry-back', this.onInquiryBack);
  }

  stepNext() {
    this.setState({step: this.state.step + 1});
  }

  stepPrevious() {
    this.setState({step: this.state.step - 1});
  }

  requestInitItems() {
    wait(1000).then(() => {
      ipc.send('request-items-init');
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

  onReplyExePathValidation(event, {errors, exePath}) {
    this.setState({exePathFieldIsBusy: false});
    if (errors.length >= 1) {
      this.setState({exePathErrors: errors});
      return;
    }
    this.config.exePath = exePath;
    this.setState({langFieldIsBusy: true});
    ipc.send('request-lang-list', this.config.exePath);
    this.stepNext();
  }

  onExePathSelect(paths) {
    this.setState({exePathErrors: [], exePathFieldIsBusy: true});
    ipc.send('request-exe-path-validation', paths[0]);
  }

  onReplyLangList(event, {langs, defaultValue}) {
    this.setState({
      langs: langs,
      langsDefaultValue: defaultValue,
      langFieldIsBusy: false
    });
    this.config.lang = defaultValue;
  }

  onLangChange(selected) {
    console.log(selected);
    this.config.lang = selected;
  }

  onClickBack() {
    this.stepPrevious();
  }

  onClickNext() {
    this.stepNext();
  }

  async onClickLast() {
    this.setState({step: 1});
    await wait(600);
    ipc.send('request-save-config', this.config);
    await wait(600);
    this.requestInitItems();
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

  onReplySaveConfig(event, err, {file, data}) {
    if (err) {
      console.error(err);
      return;
    }
    console.log(file, data);
  }

  onInquiryBack() {
    this.stepPrevious();
  }

  onItemsBuildStart() {
    wait(600).then(() => {
      this.setState({isItemsInProgress: true});
    });
  }

  onItemsBuildProgress(event, err, state) {
    if (err) {
      console.error(err);
      return;
    }
    const {max, value} = state;
    this.setState({
      itemsMax: max,
      itemsValue: value
    });
  }

  async onItemsBuildDone() {
    this.setState({isItemsInProgress: false});
    await wait(1000);
    this.setState({isIndexerInProgress: true});
  }

  onIndexerBuildStart() {}

  onIndexerBuildProgress(event, err, state) {
    if (err) {
      console.error(err);
      return;
    }
    const {max, value} = state;
    this.setState({
      indexerMax: max,
      indexerValue: value
    });
  }

  onIndexerBuildDone() {
    wait(600).then(() => {
      this.setState({isIndexerInProgress: false});
    });
  }

  onIndexerInitDone() {
    wait(1000).then(() => {
      this.props.emitter.emit('init-done');
    });
  }

  renderStep() {
    const {emitter} = this.props;
    const {
      step,
      indicatorMessage,
      isItemsInProgress,
      itemsMax,
      itemsValue,
      isIndexerInProgress,
      indexerMax,
      indexerValue,
      exePathFieldIsBusy,
      exePathErrors,
      langs,
      langsDefaultValue,
      langFieldIsBusy
    } = this.state;

    const buttonClassDefault = {
      'button': true,
      'is-large': true,
      'is-outlined': true,
      'is-black': true
    };

    const backButtonClass = classNames(buttonClassDefault);
    const lastButtonClass = classNames({
      ...buttonClassDefault,
      'is-disabled': langFieldIsBusy
    });

    const indicatorProps = {
      message: indicatorMessage,
      isItemsInProgress: isItemsInProgress,
      itemsMax: itemsMax,
      itemsValue: itemsValue,
      isIndexerInProgress: isIndexerInProgress,
      indexerMax: indexerMax,
      indexerValue: indexerValue
    };

    const exePathFieldProps = {
      emitter: emitter,
      isBusy: exePathFieldIsBusy,
      onDialogOpen: () => this.setState({exePathFieldIsBusy: true}),
      onDialogCancel: () => this.setState({exePathFieldIsBusy: false}),
      onDialogSelect: this.onExePathSelect,
      buttonSize: 'large'
    };

    const langFieldProps = {
      emitter: emitter,
      exePath: this.config.exePath,
      langs: langs,
      defaultValue: langsDefaultValue,
      isBusy: langFieldIsBusy,
      size: 'medium',
      onChange: this.onLangChange
    };

    switch (step) {
      case 1:
        return (
          <ReactCSSTransitionGroup {...STEP_TRANSITIONS}>
            <div className='title-screen' key={step}>
              <Title />
              <BuildIndicator {...indicatorProps} />
            </div>
          </ReactCSSTransitionGroup>
        );
      case 2:
        return (
          <ReactCSSTransitionGroup {...STEP_TRANSITIONS}>
            <div className='exe-path-field-container' key={step}>
              <h1>Select CDDA executable.</h1>
              <ExePathField {...exePathFieldProps} />
              <div className='errors'>
                <ErrorList errors={exePathErrors} />
              </div>
              <section className='examples'>
                <h6>Examples</h6>
                <ul className='help is-black'>
                  <li>cataclysmdda\0.C\cataclysm-tiles.exe</li>
                  <li>~/Application/Cataclysm.app</li>
                  <li>~/cataclysmdda/0.C/cataclysm-launcher</li>
                </ul>
              </section>
            </div>
          </ReactCSSTransitionGroup>
        );
      case 3:
        return (
          <ReactCSSTransitionGroup {...STEP_TRANSITIONS}>
            <div className='lang-field-container' key={step}>
              <h1>Select Language.</h1>
              <LangField {...langFieldProps} />
              <nav className='step-control'>
                <button onClick={this.onClickBack} className={backButtonClass}>
                  <i className='fa fa-chevron-left fa-pull-left' aria-hidden={true}></i>
                  <span>Back</span>
                </button>
                <button onClick={this.onClickLast} className={lastButtonClass}>
                  <span>Next</span>
                  <i className='fa fa-chevron-right fa-pull-right' aria-hidden={true}></i>
                </button>
              </nav>
            </div>
          </ReactCSSTransitionGroup>
        );
    }
  }

  render() {
    return (
      <div className='inquirer'>
        <TitleBar />
        <main className='inquirer-body'>
          <div className='content'>
            {this.renderStep()}
          </div>
        </main>
      </div>
    );
  }

}
