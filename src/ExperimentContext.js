import React from 'react';

// Create context with default values here and make sure the argument passed has the same shape
// as the `value` prop passed in to the Provider component
const ExperimentContext = React.createContext({
  exps: {},
  updateExperiments: () => {},
});

export default ExperimentContext;
