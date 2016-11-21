'use strict';

import {EventEmitter} from 'events';
import React, {PropTypes} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ProgressBar from './progress-bar';

const PROGRESS_BAR_TRANSITIONS = {
  component: 'div',
  transitionName: 'progress',
  transitionAppear: true,
  transitionAppearTimeout: 600,
  transitionEnterTimeout: 600,
  transitionLeaveTimeout: 600
};

export default class BuildIndicator extends React.Component {

  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter),
      message: PropTypes.string,
      isItemsInProgress: PropTypes.bool.isRequired,
      itemsMax: PropTypes.number.isRequired,
      itemsValue: PropTypes.number.isRequired,
      isIndexerInProgress: PropTypes.bool.isRequired,
      indexerMax: PropTypes.number.isRequired,
      indexerValue: PropTypes.number.isRequired,
      classNames: PropTypes.string
    };
  }

  render() {
    const {
      message,
      isItemsInProgress,
      itemsMax,
      itemsValue,
      isIndexerInProgress,
      indexerMax,
      indexerValue,
      classNames
    } = this.props;

    const renderProgressIfActive = () => {
      return [{
        inProgress: isItemsInProgress,
        max: itemsMax,
        value: itemsValue,
        rate: Math.round(itemsValue / itemsMax * 100)
      }, {
        inProgress: isIndexerInProgress,
        max: indexerMax,
        value: indexerValue,
        rate: Math.round(indexerValue / indexerMax * 100)
      }]
        .map((e, i) => {
          const {inProgress, max, value, rate} = e;
          const props = {max, value, rate, classNames, key: i};
          return inProgress
            ? (<ProgressBar {...props} />)
            : false;
        });
    };

    const loaderStyle = {
      margin: 'auto'
    };

    return (
      <section className='build-indicator'>
        <p className='spinner has-text-centered'>
          <span className='loader' aria-hidden={true} style={loaderStyle}></span>
        </p>
        <div className='progress-indicator'>
          <ReactCSSTransitionGroup {...PROGRESS_BAR_TRANSITIONS}>
            {renderProgressIfActive()}
          </ReactCSSTransitionGroup>
        </div>
        <p className='log'>{message}</p>
      </section>
    );
  }
}
