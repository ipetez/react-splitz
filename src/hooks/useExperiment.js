import React from 'react';
import ExperimentContext from '../ExperimentContext';

export const useExperiment = experimentName => {
  const expContext = React.useContext(ExperimentContext);
  const { exps = {}, updateExperiments } = expContext;
  const experiment = exps[experimentName];

  const updateDecorator = variant => {
    updateExperiments({
      [experimentName]: variant,
    });
  };

  return {
    variant: experiment && experiment.chosenVariantName,
    updateExperiments: updateDecorator,
  };
};
