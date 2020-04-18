import React from 'react';
import { mount } from 'enzyme';
import PropTypes from 'prop-types';
import TestContainer from '../../src/components/TestContainer';
import withTest from '../../src/components/withTest';
import { experimentConfig } from '../constants';

class WrappedComponent extends React.Component {
  render() {
    const { buttonSizeExp } = this.props;
    const variant = buttonSizeExp && buttonSizeExp.variant;
    let text = 'This is the default text';

    if (variant === 'small') {
      text = 'Small variant is shown';
    } else if (variant === 'medium') {
      text = 'Medium variant is shown';
    } else if (variant == -'big') {
      text = 'Big variant is shown';
    }

    return <p onClick={this.props.updateExperiments}>{text}</p>;
  }
}

WrappedComponent.propTypes = {
  buttonSizeExp: PropTypes.object,
  updateExperiments: PropTypes.func,
};

const forcedExperiments = {
  'button-size': 'medium',
};
describe('withTest HOC', () => {
  it('should display text for `medium` variant', () => {
    const mapExperimentsToProps = {
      buttonSizeExp: 'button-size',
    };
    const SubscribedComponent = withTest(mapExperimentsToProps)(
      WrappedComponent
    );
    const wrapper = mount(
      <TestContainer
        experiments={experimentConfig}
        forcedExperiments={forcedExperiments}
      >
        <SubscribedComponent />
      </TestContainer>
    );

    expect(wrapper.find('p').text()).toBe('Medium variant is shown');
  });

  it('should fall back to default text if experiemnt not found or not subscribe to', () => {
    const mapExperimentsToProps = {};
    const SubscribedComponent = withTest(mapExperimentsToProps)(
      WrappedComponent
    );
    const wrapper = mount(
      <TestContainer experiments={experimentConfig}>
        <SubscribedComponent />
      </TestContainer>
    );

    expect(wrapper.find('p').text()).toBe('This is the default text');
  });

  it('should only add the `updateExperiments` prop if option is passed in', () => {
    const CompWithoutUpdateProp = withTest({})(WrappedComponent);
    const CompWithUpdateProp = withTest({}, { updateExperiments: true })(
      WrappedComponent
    );
    const wrapperWithoutUpdate = mount(
      <TestContainer experiments={experimentConfig}>
        <CompWithoutUpdateProp />
      </TestContainer>
    );
    const wrapperWithUpdate = mount(
      <TestContainer experiments={experimentConfig}>
        <CompWithUpdateProp />
      </TestContainer>
    );

    // Wrapped component should not have `updateExperiments` when option isn't passed to withTest
    expect(
      wrapperWithoutUpdate.find(WrappedComponent).props().updateExperiments
    ).toBeUndefined();
    // Wrapped component should have `updateExperiments` here
    expect(
      wrapperWithUpdate.find(WrappedComponent).props().updateExperiments
    ).toBeDefined();
  });

  it('should update the context and wrapped component prop to a different variant', () => {
    const mapExperimentsToProps = {
      buttonSizeExp: 'button-size',
    };
    const SubscribedComponent = withTest(mapExperimentsToProps, {
      updateExperiments: true,
    })(WrappedComponent);
    const wrapper = mount(
      <TestContainer
        experiments={experimentConfig}
        forcedExperiments={forcedExperiments}
      >
        <SubscribedComponent />
      </TestContainer>
    );

    // Should render initially with the `medium` variant selected
    const wrappedComp = wrapper.find(WrappedComponent);
    const wrappedInstance = wrappedComp.instance();

    expect(wrappedInstance.props.buttonSizeExp.variant).toBe('medium');

    // Let's update the experiment variant to `big`
    wrappedInstance.props.updateExperiments({
      'button-size': 'big',
    });
  });
});
