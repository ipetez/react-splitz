import React from 'react';
import TestContainer from './components/TestContainer';
import withTest from './components/withTest';

// Create context with default values here and make sure the argument passed has the same shape
// as the `value` prop passed in to the Provider component
export const ExperimentContext = React.createContext({
  exps: {},
  updateExperiments: () => {},
});

export { TestContainer, withTest };
