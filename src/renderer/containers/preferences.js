'use strict';

import {EventEmitter} from 'events';
import {ipcRenderer as ipc} from 'electron';
import React, {PropTypes} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classNames from 'classnames';
import Mousetrap from 'mousetrap';
import throttle from 'lodash.throttle';
import TitleBar from '../components/titlebar';
import ExePathField from '../components/exe-path-field';
import LangField from '../components/lang-field';
import ErrorList from '../components/error-list';
import BuildIndicator from '../components/build-indicator';
import wait from '../../lib/wait';

const THROTTLE_WAIT = 300;
const THROTTLE_OPTIONS = {leading: true, trailing: true};

const FOOTER_TRANSITIONS = {
  component: 'div',
  transitionName: 'preference-footer',
  transitionEnterTimeout: 200,
  transitionLeaveTimeout: 200
};

export default class Preferences extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      isBusy: true,
      hasChanged: false,
      exePath: '',
      exePathPrev: '',
      exePathErrors: [],
      lang: '',
      langPrev: '',
      langs: [],
      isInProgress: false,
      indexIgnoreKeys: [],
      indexIgnoreKeysPrev: [],
      indicatorMessage: '',
      isItemsInProgress: false,
      itemsMax: 0,
      itemsValue: 0,
      isIndexerInProgress: false,
      indexerMax: 0,
      indexerValue: 0,
    };

    this.onReplyPreferences = this.onReplyPreferences.bind(this);
    this.onReplyExePathValidation = this.onReplyExePathValidation.bind(this);
    this.onReplyLangList = this.onReplyLangList.bind(this);
    this.onReplySaveConfig = this.onReplySaveConfig.bind(this);
    this.onClickClose = this.onClickClose.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.onLangChange = this.onLangChange.bind(this);
    this.onClickForceRebuild = this.onClickForceRebuild.bind(this);
    this.onClickDiscard = this.onClickDiscard.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onInfo = this.onInfo.bind(this);
    this.onError = this.onError.bind(this);
    this.onItemsBuildStart = this.onItemsBuildStart.bind(this);
    this.onItemsBuildProgress = this.onItemsBuildProgress.bind(this);
    this.onItemsBuildDone = this.onItemsBuildDone.bind(this);
    this.onIndexerBuildStart = this.onIndexerBuildStart.bind(this);
    this.onIndexerBuildProgress = this.onIndexerBuildProgress.bind(this);
    this.onIndexerBuildDone = this.onIndexerBuildDone.bind(this);

    this.throttledItemsBuildProgress = throttle(
      this.onItemsBuildProgress, THROTTLE_WAIT, THROTTLE_OPTIONS
    );
    this.throttledIndexerBuildProgress = throttle(
      this.onIndexerBuildProgress, THROTTLE_WAIT, THROTTLE_OPTIONS
    );
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired
    };
  }

  componentDidMount() {
    Mousetrap.bind('esc', this.close);
    ipc.on('reply-preferences', this.onReplyPreferences);
    ipc.on('open-preferences', this.open);
    ipc.on('reply-exe-path-validation', this.onReplyExePathValidation);
    ipc.on('reply-lang-list', this.onReplyLangList);
    ipc.on('reply-save-config', this.onReplySaveConfig);

    ipc.on('info', this.onInfo);
    ipc.on('error', this.onError);
    ipc.on('items-build-start', this.onItemsBuildStart);
    ipc.on('items-build-progress', this.throttledItemsBuildProgress);
    ipc.on('items-build-done', this.onItemsBuildDone);
    ipc.on('indexer-build-start', this.onIndexerBuildStart);
    ipc.on('indexer-build-progress', this.throttledIndexerBuildProgress);
    ipc.on('indexer-build-done', this.onIndexerBuildDone);

    this.setState({isBusy: true});
    ipc.send('request-preferences');
  }

  componentWillUnmount() {
    Mousetrap.unbind('esc');
    ipc.removeListener('reply-preferences', this.onReplyPreferences);
    ipc.removeListener('reply-exe-path-validation', this.onReplyExePathValidation);
    ipc.removeListener('reply-lang-list', this.onReplyLangList);
    ipc.removeListener('reply-save-config', this.onReplySaveConfig);
    ipc.removeListener('open-preferences', this.open);
    ipc.removeListener('info', this.onInfo);
    ipc.removeListener('error', this.onError);
    ipc.removeListener('items-build-start', this.onItemsBuildStart);
    ipc.removeListener('items-build-progress', this.throttledItemsBuildProgress);
    ipc.removeListener('items-build-done', this.onItemsBuildDone);
    ipc.removeListener('indexer-build-start', this.onIndexerBuildStart);
    ipc.removeListener('indexer-build-progress', this.throttledIndexerBuildProgress);
    ipc.removeListener('indexer-build-done', this.onIndexerBuildDone);
    ipc.removeListener('indexer-init-done', this.onIndexerInitDone);
    this.props.emitter.removeListener('lang-change', this.onLangChange);
  }

  onReplyPreferences(event, data) {
    console.log('onReplyPreferences', data);
    const state = {
      ...data,
      exePathPrev: data.exePath,
      langPrev: data.lang,
      indexIgnoreKeysPrev: [...data.indexIgnoreKeys],
      isBusy: false
    };
    this.setState(state);
  }

  onReplyExePathValidation(event, {errors, exePath}) {

    if (errors.length > 0) {
      this.setState({
        exePath: exePath,
        exePathErrors: errors,
        isBusy: false
      });
      return;
    }

    const state = {
      hasChanged: this.shouldConfigUpdate({exePath: exePath}),
      exePath: exePath,
      exePathErrors: [],
      isBusy: false
    };

    this.setState(state);

    ipc.send('request-lang-list', exePath);
  }

  onReplyLangList(event, {langs}) {
    const lang = this.state.lang === ''
      ? this.state.langPrev
      : this.state.lang;
    this.setState({
      lang: lang,
      langs: langs,
      isBusy: false
    });
  }

  onReplySaveConfig() {
    ipc.send('request-items-init', {rebuild: true});
  }

  onClickClose() {
    this.close();
  }

  onClickForceRebuild() {
    ipc.send('request-items-init', {rebuild: true});
  }

  onClickDiscard() {
    this.discard();
    this.close();
  }

  onClickSave() {
    this.requestSave();
  }

  onLangChange(lang) {
    const state = {
      lang: lang,
      hasChanged: this.shouldConfigUpdate({lang: lang})
    };
    this.setState(state);
    console.log('onLangChange', state);
  }

  onInfo(event, ...args) {
    this.setState({indicatorMessage: args.join('\n')});
  }

  onError(event, ...args) {
    this.setState({indicatorMessage: args.join('\n')});
  }

  onItemsBuildStart() {
    this.setState({
      isInProgress: true,
      isItemsInProgress: true
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

  async onIndexerBuildDone() {
    this.setState({isIndexerInProgress: false});
    await wait(1000);
    this.setState({isInProgress: false});
    await wait(1000);
    this.close();
  }

  open() {
    this.setState({isOpen: true});
    this.refs.modal.style.display = '';
  }

  async close() {
    this.setState({isOpen: false});
    wait(1000);
    this.refs.modal.style.display = 'none';
  }

  discard() {
    const {exePathPrev, langPrev, indexIgnoreKeysPrev} = this.state;
    this.setState({
      isBusy: false,
      hasChanged: false,
      exePath: exePathPrev,
      lang: langPrev,
      indexIgnoreKeys: indexIgnoreKeysPrev
    });
  }

  requestSave() {
    const {exePath, lang, indexIgnoreKeys} = this.state;
    const values = {exePath, lang, indexIgnoreKeys};
    ipc.send('request-save-config', values);
  }

  shouldConfigUpdate(state) {
    const s = {
      exePath: this.state.exePath,
      lang: this.state.lang,
      indexIgnoreKeys: this.state.indexIgnoreKeys,
      ...state
    };

    const values = [
      [s.exePath, this.state.exePathPrev],
      [s.lang, this.state.langPrev],
      [s.indexIgnoreKeys, this.state.indexIgnoreKeysPrev]
    ];

    return values.some(v => {
      const prev = v[0];
      const current = v[1];
      if (Array.isArray(prev) && Array.isArray(current)) {
        return prev.some((e, i) => e !== current[i]);
      }
      return prev !== current;
    });
  }

  render() {
    const {emitter} = this.props;
    const {
      isOpen,
      isBusy,
      hasChanged,
      exePath,
      exePathErrors,
      lang,
      langs,
      isInProgress,
      indicatorMessage,
      isItemsInProgress,
      itemsMax,
      itemsValue,
      isIndexerInProgress,
      indexerMax,
      indexerValue
    } = this.state;

    const hasExePathErrors = exePathErrors.length > 0;
    const modalClasses = classNames({
      'preferences': true,
      'modal': true,
      'is-open': isOpen,
      'is-not-open': !isOpen
    });

    const preferencesBodyClasses = classNames({
      'preferences-body': true,
      'is-in-progress': isInProgress
    });

    const saveControlClasses = classNames({
      'control': true,
      'is-disabled': hasExePathErrors || isInProgress
    });

    const saveButtonClasses = classNames({
      'button': true,
      'is-primary': true,
      'is-disabled': hasExePathErrors || isInProgress
    });

    const currentExePathClasses = classNames({
      'current-exe-path': true,
      'has-error': hasExePathErrors || isInProgress
    });

    const titleBarProps = {
      title: 'Preferences',
      hasCloseButton: true,
      onClickCloseButton: this.close
    };

    const indicatorProps = {
      message: indicatorMessage,
      isItemsInProgress: isItemsInProgress,
      itemsMax: itemsMax,
      itemsValue: itemsValue,
      isIndexerInProgress: isIndexerInProgress,
      indexerMax: indexerMax,
      indexerValue: indexerValue,
      classNames: 'progress is-small is-primary'
    };

    const exePathFieldProps = {
      emitter: emitter,
      isBusy: isBusy,
      onDialogOpen: () => this.setState({isBusy: true}),
      onDialogCancel: () => this.setState({isBusy: false}),
      onDialogSelect: (paths) => {
        this.setState({isBusy: true});
        ipc.send('request-exe-path-validation', paths[0]);
      }
    };

    const langFieldProps = {
      emitter: emitter,
      isBusy: isBusy,
      exePath: exePath,
      defaultValue: lang,
      langs: langs,
      onChange: this.onLangChange
    };

    return (
      <div className={modalClasses} ref='modal' style={{display: 'none'}}>

        <TitleBar {...titleBarProps} />

        <section className={preferencesBodyClasses}>
          <div className='content'>

            <ReactCSSTransitionGroup {...FOOTER_TRANSITIONS}>
              {isInProgress &&
              <section className='section build-indicator-container'>
                <BuildIndicator {...indicatorProps} />
              </section>
              }
            </ReactCSSTransitionGroup>

            <section className='section'>
              <h2>Dataset</h2>
              <button className='button is-primary' onClick={this.onClickForceRebuild}>
                Force rebuild
              </button>
              <p className='help'>This will start rebuilding immediately without changing config.</p>
            </section>

            <section className='section'>
              <h2>Executable path</h2>
              <ExePathField {...exePathFieldProps} />
              <p className={currentExePathClasses}>{exePath}</p>
              {
                hasExePathErrors &&
                <div className='errors notification is-primary'>
                  <ErrorList errors={exePathErrors} />
                </div>
              }
              <section className='notification'>
                <h6>Examples</h6>
                <ul>
                  <li>cataclysmdda\0.C\cataclysm-tiles.exe</li>
                  <li>~/Application/Cataclysm.app</li>
                  <li>~/cataclysmdda/0.C/cataclysm-launcher</li>
                </ul>
              </section>
            </section>

            <section className='section'>
              <h2>Language</h2>
              <LangField {...langFieldProps} />
            </section>

          </div>
        </section>
        <ReactCSSTransitionGroup {...FOOTER_TRANSITIONS}>
          {
            hasChanged &&
            <footer className='preferences-footer'>
              <div className='container'>
                <div className='control is-grouped is-grouped-right'>
                  <p className='help-message'>
                <span className="help is-danger">
                  <i className='icon is-small fa fa-exclamation-circle'></i>
                  Will start rebuilding after saving
                </span>
                  </p>
                  <p className='control'>
                    <a className='button is-outlined' onClick={this.onClickDiscard}>Discard</a>
                  </p>
                  <p className={saveControlClasses}>
                    <a className={saveButtonClasses} onClick={this.onClickSave}>Save</a>
                  </p>
                </div>
              </div>
            </footer>
          }
        </ReactCSSTransitionGroup>
      </div>
    );
  }

}
