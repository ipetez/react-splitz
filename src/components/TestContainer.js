import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  inBrowser,
  cookie,
  filterValidUpdates,
  warning,
  generateCookieFromState,
} from '../util';
import { ExperimentContext } from '../index';
import initializeExperiments from '../initialize';
import { STATE_COOKIE } from '../constants';

// Sets all active experiments on the context
class TestContainer extends Component {
  constructor() {
    super(...arguments);
    this.updateExperiments = this.updateExperiments.bind(this);
    this.state = {
      exps: this.getChosenVariants(),
      updateExperiments: this.updateExperiments,
    };
  }

  getChosenVariants() {
    const {
      experiments,
      forcedExperiments,
      disableAll,
      getExperiments,
    } = this.props;

    let { getCookie, setCookie } = this.props;

    if (inBrowser()) {
      getCookie = cookie.get;
      setCookie = cookie.set;
    }

    const ExperimentInfo = initializeExperiments({
      experiments,
      getCookie,
      setCookie,
      forcedExperiments,
      disableAll,
    });

    const { chosenExperiments } = ExperimentInfo;

    if (typeof getExperiments === 'function') {
      getExperiments(chosenExperiments);
    }

    return chosenExperiments;
  }

  // We can update the context by using and change what active experiments
  // are running with this function that is accessible to any `withTest` wrapped component
  updateExperiments(updatedExperiments, callback) {
    if (!inBrowser()) {
      warning(
        'updateExperiments() can only be called in the browser. This is a no-op. Please check the code where you are calling this function.'
      );
      return;
    }

    const validUpdates = filterValidUpdates(
      this.state.exps,
      updatedExperiments
    );

    const newExpState = {
      ...this.state.exps,
      ...validUpdates,
    };

    this.setState(
      {
        exps: newExpState,
      },
      () => {
        if (typeof callback === 'function') {
          return callback();
        }
      }
    );

    const cookieState = generateCookieFromState(newExpState);
    // Set new cookie state
    cookie.set(STATE_COOKIE, JSON.stringify(cookieState));
  }

  render() {
    return (
      <ExperimentContext.Provider value={this.state}>
        {React.Children.only(this.props.children)}
      </ExperimentContext.Provider>
    );
  }
}

TestContainer.propTypes = {
  children: PropTypes.element.isRequired,
  experiments: PropTypes.arrayOf(PropTypes.object),
  getCookie: PropTypes.func,
  setCookie: PropTypes.func,
  forcedExperiments: PropTypes.object,
  disableAll: PropTypes.bool,
  getExperiments: PropTypes.func,
};

export default TestContainer;
