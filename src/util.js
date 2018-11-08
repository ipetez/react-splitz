// Loop through the 'experiment to props' mapping and get chosen variant
// for a given experiment with the name prop name specified.
export function addExperimentsToProps(state, mapExperimentsToProps) {
  const subscribedExperiments = {};

  Object.keys(mapExperimentsToProps).forEach(propName => {
    const experimentName = mapExperimentsToProps[propName];

    const runningExperiment = state[experimentName];
    if (runningExperiment) {
      subscribedExperiments[propName] = {
        variant: runningExperiment.chosenVariantName,
      };
    }
  });

  return subscribedExperiments;
}

export function inBrowser() {
  return typeof window === 'object' && window !== 'null';
}

export function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

export const cookie = {
  get(name) {
    if (inBrowser()) {
      const eq = name + '=',
        ca = document.cookie.split(';');
      let c = null;

      for (let i = 0; i < ca.length; i += 1) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(eq) === 0) {
          return decodeURIComponent(c.substring(eq.length, c.length));
        }
      }
    }
    return null;
  },
  set(name, value, days = 365) {
    if (inBrowser()) {
      const key = name + '=' + encodeURIComponent(value),
        path = 'path=/',
        date = new Date();

      date.setTime(date.getTime() + days * (1000 * 60 * 60 * 24));

      const expires = 'expires=' + date.toGMTString();

      document.cookie = [key, expires, path].join(';');
    }
  },
  clear(name) {
    cookie.set(name, '', -1);
  },
};

export function randomIntBetween(min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Add weighted probability to items in an array
export function applyWeightsToVariants(list) {
  const weightedList = [];

  list.forEach(variant => {
    const { weight } = variant;
    const multiples = weight ? weight * 10 : 1;

    for (let j = 0; j < multiples; j++) {
      weightedList.push(variant);
    }
  });

  return weightedList;
}

// Check to make sure that the experiments being set are currently running experiments
export function getInvalidUpdates(activeExps, updatedExps) {
  const invalidUpdates = [];

  for (const [experiment] of Object.entries(updatedExps)) {
    if (typeof activeExps[experiment] === 'undefined') {
      invalidUpdates.push(experiment);
      warning(
        `Experiment "${experiment}" is not a currently running experiment and therefore cannot be updated. Check your input in the 'updateExperiments function to make sure you don't have a typo`
      );
    }
  }

  return invalidUpdates;
}

export function getVariantByName(variants, name) {
  return variants.filter(variant => {
    return variant.name === name;
  })[0];
}

export function generateChosenExperiment({
  variants,
  chosenVariantName,
  name,
}) {
  return {
    name,
    chosenVariantName,
    variants,
  };
}

export function pickVariant(variants) {
  // Apply probability weights to variants if they are provided
  variants = applyWeightsToVariants(variants);

  const chosenVariantIndex = randomIntBetween(0, variants.length - 1);

  return variants[chosenVariantIndex];
}
