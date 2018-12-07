import {
  addExperimentsToProps,
  applyWeightsToVariants,
  filterValidUpdates,
  getVariantByName,
  generateCookieFromState,
} from '../../src/util';
import { experimentConfig, experimentState } from '../constants';

describe('util functions', () => {
  it('addExperimentsToProps() should return props with experiments subscribed to', () => {
    const mapExpsToProps = {
      expButtonSize: 'button-size',
      expButtonColor: 'button-color',
    };
    const experimentProps = addExperimentsToProps(
      experimentState,
      mapExpsToProps
    );

    expect(experimentProps).toEqual({
      expButtonSize: {
        variant: 'small',
      },
      expButtonColor: {
        variant: 'red',
      },
    });
  });

  it('should add weights to variants', () => {
    const variantList = experimentConfig[0].variants;
    const variantCount = {
      defaultVariants: [],
      smallVariants: [],
      mediumVariants: [],
      bigVariants: [],
    };

    const weightedList = applyWeightsToVariants(variantList);

    for (const variant of weightedList) {
      const { name } = variant;

      variantCount[`${name}Variants`].push(variant);
    }

    expect(variantCount.defaultVariants).toHaveLength(1);
    expect(variantCount.smallVariants).toHaveLength(2);
    expect(variantCount.mediumVariants).toHaveLength(3);
    expect(variantCount.bigVariants).toHaveLength(4);
  });

  it('should call console.error twice with 2 invalid experiment updates', () => {
    const invalidUpdates = {
      'button-type': 'rounded', // Non-existent experiment,
      'button-color': 'green', // Invalid variant choice
    };

    const consoleSpy = jest.spyOn(global.console, 'error');

    expect(consoleSpy).not.toHaveBeenCalled();

    filterValidUpdates(experimentState, invalidUpdates);

    expect(consoleSpy).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
  });

  it('should return variant by name', () => {
    expect(getVariantByName(experimentConfig[1].variants, 'white').name).toBe(
      'white'
    );
  });

  it('should return cookie state from active experiments', () => {
    expect(generateCookieFromState(experimentState)).toEqual({
      'button-size': 'small',
      'button-color': 'red',
      'recommended-content': 'recommend',
    });
  });
});
