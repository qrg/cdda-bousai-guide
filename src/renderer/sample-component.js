'use strict';

import React from 'react';

class Sample extends React.Component {

  constructor(props) {
    super(props);
    console.log(props);
    this.state = {count: props.initialCount};
    this.countUp = this.countUp.bind(this);
  }

  countUp() {
    console.log('clicked', this.state);
    this.setState({
      count: this.state.count + 1
    });
  }

  render() {
    return (
      <div className='counter'>
        <button onClick={this.countUp} className='button is-outlined is-primary is-medium'>
          Count
        </button>
        <span className='tag is-primary is-large'>{this.state.count}</span>
      </div>
    );
  }

}

Sample.propTypes = {
  initialCount: React.PropTypes.number
};
Sample.defaultProps = {
  initialCount: 0
};

export default Sample;
