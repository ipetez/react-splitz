import React, { Component } from 'react';
import { addExperimentsToProps } from '../util';
import { ExperimentContext } from '../index';

// Higher-order component used to subscribe a component to the experiments
// it cares about and maps those experiments to the props of that component.
// Uses React's context API to achieve this
export default function withTest(WrappedComponent, mapExperimentsToProps) {
  class TestWrapper extends Component {
    constructor(props) {
      super(props);
      this.wrappedComponent = React.createRef();
    }
    render() {
      return (
        <ExperimentContext.Consumer>
          {expState => {
            const { exps, updateExperiments } = expState;
            const subscribedExperiments = addExperimentsToProps(
              exps,
              mapExperimentsToProps
            );

            // In addition to adding experiments as props to wrapped component, also pass down any props
            // passed in through to the HOC
            return (
              <WrappedComponent
                {...subscribedExperiments}
                {...this.props}
                updateExperiments={updateExperiments}
                ref={this.wrappedComponent}
              />
            );
          }}
        </ExperimentContext.Consumer>
      );
    }
  }

  return TestWrapper;
}
