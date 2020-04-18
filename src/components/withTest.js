import React from 'react';
import PropTypes from 'prop-types';
import { addExperimentsToProps } from '../util';
import ExperimentContext from '../ExperimentContext';

// Higher-order component used to subscribe a component to the experiments
// it cares about and maps those experiments to the props of that component.
// Uses React's context API to achieve this
export default function withTest(mapExperimentsToProps, options) {
  options = options || {};

  return WrappedComponent => {
    function TestWrapper(props) {
      const { forwardedRef, ...rest } = props;

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
                ref={forwardedRef}
                {...additionalProps}
              />
            );
          }}
        </ExperimentContext.Consumer>
      );
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.BUILD_ENV !== 'umd'
    ) {
      TestWrapper.propTypes = {
        forwardedRef: PropTypes.oneOfType([
          PropTypes.func,
          PropTypes.shape({ current: PropTypes.elementType }),
        ]),
      };
    }
    const WrapperComponent = React.memo(TestWrapper);

    return React.forwardRef(function forwardRef(props, ref) {
      return <WrapperComponent {...props} forwardedRef={ref} />;
    });
  };
}
