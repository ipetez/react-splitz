import React from 'react';
import { mount } from 'enzyme';
import TestContainer from '../../src/components/TestContainer';

const experimentConfig = [
  {
    name: 'recommended-content',
    variants: [{ name: 'recommend' }],
  },
];

describe('<TestContainer />', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  it('should throw an error if experiment prop is not provided', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      mount(
        <TestContainer>
          <div />
        </TestContainer>
      );
    }).toThrow(
      'The `experiments` prop must be an array and provided to `TestContainer` in order to enable experiments.'
    );

    spy.mockRestore();
  });

  it('should call this.getChosenVariants() when component is about to mount', () => {
    const getChosenVariantsMock = jest.spyOn(
      TestContainer.prototype,
      'getChosenVariants'
    );

    expect(getChosenVariantsMock).not.toHaveBeenCalled();

    mount(
      <TestContainer experiments={experimentConfig}>
        <div />
      </TestContainer>
    );

    expect(getChosenVariantsMock).toHaveBeenCalled();
  });

  it('should correctly set experiment state on TestContainer', () => {
    const wrapper = mount(
      <TestContainer experiments={experimentConfig}>
        <div />
      </TestContainer>
    );

    expect(wrapper.state().exps).toEqual({
      'recommended-content': {
        name: 'recommended-content',
        chosenVariantName: 'recommend',
        variants: [{ name: 'recommend' }],
      },
    });
  });

  it('should have `updateExperiments` function in the state object', () => {
    const wrapper = mount(
      <TestContainer experiments={experimentConfig}>
        <div />
      </TestContainer>
    );

    expect(typeof wrapper.state().updateExperiments === 'function').toBe(true);
  });

  it('should call `getExperiments` function prop if provided', () => {
    const getExperimentsMock = jest.fn();
    expect(getExperimentsMock).not.toHaveBeenCalled();

    mount(
      <TestContainer
        experiments={experimentConfig}
        getExperiments={getExperimentsMock}
      >
        <div />
      </TestContainer>
    );

    expect(getExperimentsMock).toHaveBeenCalledWith({
      'recommended-content': {
        name: 'recommended-content',
        chosenVariantName: 'recommend',
        variants: [{ name: 'recommend' }],
      },
    });
  });

  it('should update experiment state with the `updateExperiments` function', () => {
    const experimentConfig = [
      {
        name: 'recommended-content',
        variants: [{ name: 'recommend' }, { name: 'default' }],
      },
    ];
    const wrapper = mount(
      <TestContainer experiments={experimentConfig}>
        <div />
      </TestContainer>
    );

    // Provide optional callback
    const callbackMock = jest.fn();
    expect(callbackMock).not.toHaveBeenCalled();

    const inst = wrapper.instance();

    inst.updateExperiments(
      {
        'recommended-content': 'recommend',
      },
      callbackMock
    );
    expect(inst.state.exps['recommended-content'].chosenVariantName).toBe(
      'recommend'
    );
    expect(callbackMock).toHaveBeenCalled();

    inst.updateExperiments({
      'recommended-content': 'default',
    });
    expect(inst.state.exps['recommended-content'].chosenVariantName).toBe(
      'default'
    );
  });

  it('should only update valid experiment updates', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const experimentConfig = [
      {
        name: 'recommended-content',
        variants: [{ name: 'recommend' }, { name: 'default' }],
      },
    ];

    const inst = mount(
      <TestContainer experiments={experimentConfig}>
        <div />
      </TestContainer>
    ).instance();

    // Set initial base variant
    inst.updateExperiments({
      'recommended-content': 'recommend',
    });
    expect(inst.state.exps['recommended-content'].chosenVariantName).toBe(
      'recommend'
    );

    // Make a valid update with a different variant
    inst.updateExperiments({
      'recommended-content': 'default',
    });
    expect(inst.state.exps['recommended-content'].chosenVariantName).toBe(
      'default'
    );

    // Set invalid experiment variant
    inst.updateExperiments({
      'recommended-content': 'noop',
    });

    // Should not update experiment with invalid variant
    expect(inst.state.exps['recommended-content'].chosenVariantName).toBe(
      'default'
    );

    spy.mockRestore();
  });
});
