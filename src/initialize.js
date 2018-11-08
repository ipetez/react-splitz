import React from 'react';
import { STATE_COOKIE } from './constants';
import {
  getVariantByName,
  generateChosenExperiment,
  pickVariant,
} from './util';

// Create context with default values here and make sure the argument passed has the same shape
// as the `value` prop passed in to the Provider component
export const ExperimentContext = React.createContext({
  exps: {},
  updateExperiments: () => {},
});

// getCookie & setCookie only need to be explicitly passed in
// for server-side rendering, unless you want to handle cookies yourself on the client.
// By default, it will assume you are initializing experiments on the client and use the 'document' object
export default function initializeExperiments({
  disableAll,
  experiments,
  getCookie,
  setCookie,
  forcedExperiments = {},
}) {
  if (typeof getCookie !== 'function' || typeof setCookie !== 'function') {
    throw new Error(
      'Both `getCookie` & `setCookie` function props must be provided when rendering components on the server.'
    );
  }

  if (!Array.isArray(experiments)) {
    throw new Error(
      'The `experiments` prop must be an array and provided to `TestContainer` in order to enable experiments.'
    );
  }

  // The experimentStateCookie object should have minimal info due to cookie size constraints.
  // The object keys should be the experiment name and the value should be the variant name.
  const experimentStateCookie = {};

  // This object will serve as the current state for all running experiments that will be filtered and
  // consumed by components within the application
  const chosenExperiments = {};

  if (!disableAll) {
    const stateCookie = JSON.parse(getCookie(STATE_COOKIE) || '{}');

    // Loop over experiments and set cookies
    experiments.forEach(({ name, variants }) => {
      const existingVariantName = stateCookie[name];
      let chosenVariantName = existingVariantName;
      let chosenVariant = getVariantByName(variants, chosenVariantName);

      // If there's a matching forced experiment with a valid variant, let's use that value
      const forcedExperimentValue = forcedExperiments[name];
      const forcedVariant = getVariantByName(variants, forcedExperimentValue);

      if (forcedVariant) {
        chosenVariantName = forcedExperimentValue;
        chosenVariant = forcedVariant;
      } else if (!existingVariantName || !chosenVariant) {
        chosenVariant = pickVariant(variants);
        chosenVariantName = chosenVariant.name;
      }
      // Add experiment and chosen variant to final experimentStateCookie object
      experimentStateCookie[name] = chosenVariantName;
      chosenExperiments[name] = generateChosenExperiment({
        name,
        chosenVariantName: chosenVariant.name,
        variants,
      });
    });
  }
  console.log('==> experimentStateCookie', experimentStateCookie);
  console.log('==> chosenExperiments', chosenExperiments);

  setCookie(STATE_COOKIE, JSON.stringify(experimentStateCookie));

  // Here we are returning experimentStateCookie with all selected/active experiment variants
  return {
    chosenExperiments,
  };
}
