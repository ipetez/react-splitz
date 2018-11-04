import React from 'react';
import { STATE_COOKIE } from './constants';
import { randomIntBetween, generateWeighedList } from './util';

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

  const chosenVariants = {};

  if (!disableAll) {
    const stateCookie = JSON.parse(getCookie(STATE_COOKIE) || '{}');

    // Loop over experiments and set cookies
    experiments.forEach(({ name, variants, weights }) => {
      const existingVariantValue = stateCookie[name];
      let chosenVariant = existingVariantValue;

      // If there's a matching forced experiment with a valid variant, let's use that value
      const forcedExperimentValue = forcedExperiments[name];

      if (
        forcedExperimentValue &&
        variants.indexOf(forcedExperimentValue) > -1
      ) {
        chosenVariant = forcedExperimentValue;
      } else if (
        !existingVariantValue ||
        variants.indexOf(existingVariantValue) === -1
      ) {
        // If an experiment is not currently set in the browser, or if the value of the chosen variant is
        // not one that currently exists in the config, then set/override the value. Otherwise, continue.
        let variantOptions;
        // Apply probability weights to variants if they are provided
        if (Array.isArray(weights)) {
          if (weights.length !== variants.length) {
            throw new Error(
              `For experiment: "${name}", length of "weights" array must be the same as length of "variants" array`
            );
          }
          variantOptions = generateWeighedList(variants, weights);
        } else {
          variantOptions = variants;
        }

        const chosenVariantIndex = randomIntBetween(
          0,
          variantOptions.length - 1
        );

        chosenVariant = variantOptions[chosenVariantIndex];
      }
      // Add experiment and chosen variant to final chosenVariants object
      chosenVariants[name] = chosenVariant;
    });
  }

  setCookie(STATE_COOKIE, JSON.stringify(chosenVariants));

  // Here we are returning chosenVariants with all selected/active experiment variants
  return {
    chosenVariants,
  };
}
