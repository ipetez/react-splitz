import { STATE_COOKIE } from './constants';
import {
  getVariantByName,
  generateChosenExperiment,
  pickVariant,
  setExperimentCookieFromState,
} from './util';

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

  // This object will serve as the current state for all running experiments that will be filtered and
  // consumed by components within the application
  const chosenExperiments = {};

  if (!disableAll) {
    const stateCookie = JSON.parse(getCookie(STATE_COOKIE) || '{}');

    // Loop over experiments and set cookies
    experiments.forEach(({ name, variants, identifier }) => {
      const existingVariantName = stateCookie[name];
      let chosenVariantName = existingVariantName;
      let chosenVariant = getVariantByName(variants, chosenVariantName);

      // If there's a matching forced experiment with a valid variant, let's use that value
      const forcedExperimentValue = forcedExperiments[name];
      const forcedVariant = getVariantByName(variants, forcedExperimentValue);

      if (forcedVariant) {
        chosenVariantName = forcedExperimentValue;
        chosenVariant = forcedVariant;
      } else if (identifier || !existingVariantName || !chosenVariant) {
        chosenVariant = pickVariant(variants, identifier);
        chosenVariantName = chosenVariant.name;
      }

      // Add all relevant info of experiment and chosen variant to experiment state
      chosenExperiments[name] = generateChosenExperiment({
        name,
        chosenVariantName: chosenVariant.name,
        variants,
      });
    });
  }

  setExperimentCookieFromState(chosenExperiments, setCookie);

  // Here we are returning chosenExperiments with all selected/active experiment variants
  return {
    chosenExperiments,
  };
}
