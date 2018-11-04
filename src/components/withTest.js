import React, { Component } from 'react';
import { addExperimentsToProps } from '../util';
import { ExperimentContext } from '../index';

// Higher-order component used to subscribe a component to the experiments
// it cares about and maps those experiments to the props of that component.
// Uses React's context API to achieve this
export default function withTest(
  WrappedComponent,
  mapExperimentsToProps,
  options = {}
) {
  class TestWrapper extends Component {
    render() {
      const { forwardRef, ...rest } = this.props;

      return (
        <ExperimentContext.Consumer>
          {expState => {
            const { exps, updateExperiments } = expState;
            const subscribedExperiments = addExperimentsToProps(
              exps,
              mapExperimentsToProps
            );

            const additionalProps = {};

            if (options.updateExperiments) {
              additionalProps.updateExperiments = updateExperiments;
            }

            // In addition to adding experiments as props to wrapped component, also pass down any props
            // passed in through to the HOC
            return (
              <WrappedComponent
                {...subscribedExperiments}
                {...rest}
                ref={forwardRef}
                {...additionalProps}
              />
            );
          }}
        </ExperimentContext.Consumer>
      );
    }
  }

  return React.forwardRef((props, ref) => {
    return <TestWrapper {...props} forwardRef={ref} />;
  });
}
