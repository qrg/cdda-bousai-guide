'use strict';

import {EventEmitter} from 'events';
import {ipcRenderer as ipc} from 'electron';
import React, {PropTypes} from 'react';
import debounce from 'lodash.debounce';
import SearchBar from '../components/search-bar';
import SearchResults from '../components/search-results';

export default class SearchBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      results: [],
      searchTime: 0
    };
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
    };
  }

  componentDidMount() {
    ipc.on('reply-search', (...args) => this.onReplySearch(...args));
    this.props.emitter.on('send-search-term', debounce(
      (...args) => this.onSendSearchTerm(...args),
      300
    ));

    this.refs['bar'].refs['input'].focus();
  }

  componentWillUnmount() {
    ipc.removeAllListeners('reply-search');
    this.props.emitter.removeAllListeners('send-search-term');
  }

  render() {
    const barProps = {
      ref: 'bar',
      emitter: this.props.emitter,
    };

    const resultsProps = {
      emitter: this.props.emitter,
      results: this.state.results,
      searchTime: this.state.searchTime
    };

    return (
      <main className='search-box'>
        <section className="section">
          <div className="container">
            <SearchBar {...barProps} />
            <SearchResults {...resultsProps} />
          </div>
        </section>
      </main>
    );
  }

  onReplySearch(event, err, {results, searchTime}) {
    if (err) {
      console.error(err);
      return;
    }
    this.setState({
      results: results,
      searchTime: searchTime
    });
  }

  onSendSearchTerm(term) {
    console.log('onSendSearchTerm', term);
    if (!term || term === '') {
      this.setState({results: []});
      return;
    }
    ipc.send('request-search', term);
  }

}
