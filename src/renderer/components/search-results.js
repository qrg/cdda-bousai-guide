'use strict';

import {EventEmitter} from 'events';
import React, {PropTypes} from 'react';
import replace from 'react-string-replace';
import {deepValue} from '../../lib/object';

export default class SearchResults extends React.Component {

  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      emitter: PropTypes.instanceOf(EventEmitter).isRequired,
      results: PropTypes.array.isRequired,
      searchTime: PropTypes.number.isRequired
    };
  }

  renderTitles(name, translation) {
    if (!translation.name) {
      return (
        <div>
          <span className='search-results-title'>{name}</span>
        </div>
      );
    }
    return (
      <div>
        <span className='search-results-title'>{translation.name}</span>
        <span className='search-results-title-sub'>{name}</span>
      </div>
    );
  }

  renderOccurrences(tokens, ref) {
    return tokens.map((t, ti) => {
      return t.keys.map((key, ki) => {
        console.log(t.token);
        const re = new RegExp(`(${t.token})`, 'gi');
        const text = deepValue(ref, key);
        const highlighted = replace(text, re, (match, mi) => {
          const key = `occurrence-${ti}-${ki}-${mi}`;
          return (<b className='occurrence-matched' key={key}>{match}</b>);
        });
        return (
          <li className='occurrence' key={`occurrence-${ti}-${ki}`}>
            <span className='occurrence-key'>{key}</span>
            <span className='occurrence-preview'>{highlighted}</span>
          </li>
        );
      });
    });
  }

  renderList(results) {
    return results.map((result, index) => {
      const {id, ref, tokens} = result;
      const {name, translation} = ref;

      const titles = this.renderTitles(name, translation);
      const occurrences = this.renderOccurrences(tokens, ref);

      return (
        <li className='search-results-item' key={`${id}-${index}`}>
          {titles}
          <ul className='occurrences'>
            {occurrences}
          </ul>
        </li>
      );
    });
  }

  render() {
    console.log(this.props);
    const {results, searchTime} = this.props;
    const summary = results.length > 0 ? `${results.length} items, ${searchTime} ms` : '';

    const list = this.renderList(results);

    return (
      <div className='search-results content'>
        <p className='search-results-summary has-text-right'>{summary}</p>
        <ul className='search-results-list'>
          {list}
        </ul>
      </div>
    );
  }

}
