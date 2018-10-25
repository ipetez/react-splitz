import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inBrowser, cookie, getInvalidUpdates } from '../util';
import { ExperimentContext } from '../index';
import initializeExperiments from '../initialize';

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
    const { experiments } = this.props;
    let { getCookie, setCookie, forcedExperiments, disableAll } = this.props;

    if (inBrowser()) {
      getCookie = cookie.get;
      setCookie = cookie.set;
    } else if (
      typeof getCookie !== 'function' ||
      typeof setCookie !== 'function'
    ) {
      throw new Error(
        'Both `getCookie` & `setCookie` function props must be provided when rendering components on the server.'
      );
    }

    if (!Array.isArray(experiments)) {
      throw new Error(
        'The `experiments` prop must be an array and provided to `TestContainer` in order to enable experiments.'
      );
    }

    const ExperimentInfo = initializeExperiments({
      experiments,
      getCookie,
      setCookie,
      forcedExperiments,
      disableAll,
    });

    const { chosenVariants } = ExperimentInfo;

    return chosenVariants;
  }

  // We can update the context by using and change what active experiments
  // are running with this function that is accessible to any `withTest` wrapped component
  updateExperiments(updatedExperiments, callback) {
    const invalidUpdates = getInvalidUpdates(
      this.state.exps,
      updatedExperiments
    );

    // Skip updates if invalid experiment keys are found
    if (invalidUpdates.length) {
      return;
    }
    this.setState(
      {
        exps: {
          ...this.state.exps,
          ...updatedExperiments,
        },
      },
      () => {
        if (typeof callback === 'function') {
          return callback();
        }
      }
    );
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
};

export default TestContainer;
