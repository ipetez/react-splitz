# React Splitz

React Splitz is an A/B and multivariate testing tool for react projects

It enables you to set and manage persistent experiments in your app and easily subscribe and access them from any component via component props we know and love. It also offers full support for **server-side rendering**
so you're able to use it in your **universal** web apps as well.

## Installation

```bash
npm install react-splitz --save
```

or with **yarn**

```bash
yarn add react-splitz
```

## Setup

First we have to import our **_<TestContainer \/>_** wrapper component to wrap around our app/top-level component. All configuration for experiments will be provided as props to this component.

> **Note:** It is essential that we wrap our component around our top level application component so that experiments and chosen experiment buckets are accessible throughout the entire application.

`index.js`

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Import TestContainer from the package
import { TestContainer } from 'react-splitz';

/**
 * Define your experiments in an array like this. In a real
 * application it might make more sense to move this array to a config file
 * and import it here.
 **/

const experiments = [
  {
    name: 'button-size',
    variants: ['default', 'small', 'medium', 'large'],
  },
  {
    name: 'signup-btn-color',
    variants: ['default', 'gray', 'blue', 'red'],
  },
];

ReactDOM.render(
  <TestContainer
    // Pass experiments array as a prop
    experiments={experiments}
  >
    <App />
  </TestContainer>,
  document.getElementById('root')
);
```

Then access running experiments from any component with the `withTest` wrapper component. In this case, we wrap the `SignupButton` component with it.

`SignupButton.js`

```js
import React, { Component } from 'react';

// Import 'withTest' wrapper here
import { withTest } from 'react-splitz';

class SignupButton extends Component {
  render() {
    /**
     * Each of these experiment prop values will be one the variants we defined
     * previously in the 'experiments' array config.
     **/
    const { expButtonColor, expButtonSize } = this.props;
    const classes = ['signup-btn']

    if (expButtonColor) { // i.e 'red'
      classes.push(`button-${expButtonColor}`) // button-red
    }

    if (expButtonSize) { // i.e 'medium'
      classes.push(`button-${expButtonSize}`) // button-medium
    }
    <button className={classes.join(' ')}>
      {'Sign Up'}
    </button>
  }
}
// Map the experiments to prop names for your SignupButton component.
// The value of the prop will be equal to the chosen variant of the
// Experiment
const mapExperimentsToProps = {
  expButtonColor: 'signup-btn-color',
  expButtonSize: 'button-size'
}

export withTest(mapExperimentsToProps)(SignupButton)
```

## Weighted Experiments

You can assign weights to experiment buckets by adding an array of decimal values (equalling 1) that will get mapped to buckets by index positioning in array. **This means that the order of weight values is important**.

> **Note:** Decimals values for weights have to be multiples of **0.10**. (0.3, 0.2 etc)

```js
const experiments = [
  {
    name: 'download-promo',
    variants: ['popup', 'button', 'fixed'],
    weights: [0.3, 0.2, 0.5], // 30% (popup) + 20% (button) + 50% (fixed) = %100
  },
];
```

## Forcing Specific Variants

This option can come in handy for situations where you want to easily test a specific variant during development or quickly switch all your user traffic to a winning variant of an experiment without having to standardize the feature right away.

All you have do is pass in the `forcedExperments` object prop to the **<TestContainer \/>** component with the experiment you want to override and the variant you want to override it with.

```jsx
const experiments = [
  {
    name: 'download-promo',
    variants: ['popup', 'button', 'fixed'],
  }
]
const forcedExperiments = {
  'download-promo': 'button' // This will force variant 'button' to be set.
}
<TestContainer
  experiments={experiments}
  forcedExperiments={forcedExperiments}
>
  <App />
</TestContainer>
```

## Get All Running Experiments

You can pass the callback function prop `getExperiments` to the **<TestContainer \/>** component which gets called once experiments are set. This function will get called with an object of currently running experiments.

#### Example

```js
const getExperiments = experiments => console.log(experiments);
```

## Disable All Experiments

If you'd like to disable all experiments at any time, pass in the `disableAll` prop to `TestContainer` and set it to `true`.

## Server-side Rendering

Server-side rendering setup for Universal JS apps are set up the same way as a client-side only web app with the addition of 2 extra required function props. You have to provide the `getCookie` and `setCookie` function props to the **<TestContainer \/>** component as ways to retrieve and set cookies on the server.

Here's an example using [Express.js](https://expressjs.com/)

```jsx
import express from 'express';
import cookieParser from 'cookie-parser';
import React from 'react';

// Import TestContainer wrapper
import { TestContainer } from 'react-splitz';

const app = express();
app.use(cookieParser());

// Define experiments
const experiments = [
  {
    name: 'button-size',
    variants: ['default', 'small', 'medium', 'large'],
  },
  {
    name: 'signup-btn-color',
    variants: ['default', 'gray', 'blue', 'red'],
  },
];

app.get('/', (req, res) => {
  res.send(
    <TestContainer
      experiments={experiments}
      getCookie={x => req.cookies[x]} // Retrieve cookie on server
      setCookie={(x, y) => res.cookie(x, y)} // Set cookie on server
    >
      <App />
    </TestContainer>
  );
});

app.listen(3000);
```

## Tracking

Using a tracking service like [Mixpanel](https://mixpanel.com/) or [Goole Analytics](https://analytics.google.com) to track running experiments is very easy. You have access to running experiments either by using the `getExperiments` callback that fires when your application is loading or you can subscribe to individual experiments using the `withTest` wrapper with your components. With that you are able to tailor how and when you make calls to these tracking services based on experiments running.

## Update Experiment Variants Instantly

You are able to update experiments to different variations/buckets on the fly without reloading your app with an option available through the `withTest` wrapper.

> **Use case:** Building a configuration dashboard to view and manage all running experiments. You can add functionality to quickly switch between variants/buckets and have them update instantly throughout your entire application. See more on how to use this feature below in [API Reference](#api-reference)

## Composability

The `withTest` higher-order component is fully composable with other higher-order components (_HOCs_) in your app.

So if you were using this with **Redux** for example you could do something like this.

```js
const EnhancedComponent = connect(mapStateToProps)(
  withTest(mapExpsToProps)(WrappedComponent)
);
```

Although, looking at this, it can be hard to follow what's going on so we recommend using a composition utility function to make things clearer to read. With that you can rewrite it as:

```js
const enhance = compose(
  connect(mapStatesToProps),
  withTest(mapExpsToProps),
  ... // Other HOCs
)

const EnhancedComponent = enhance(WrappedComponent);
```

The `compose` utility function is provided by many third-party libraries including lodash (as [`lodash.flowRight`](https://lodash.com/docs/#flowRight)), [Redux](http://redux.js.org/docs/api/compose.html), and [Ramda](http://ramdajs.com/docs/#compose).

# API Reference

## `<TestContainer />` option props

`experiments` - (_Array [required]_): Running experiments. See above for examples.
`disableAll` - (_Boolean [optional]_): Option to isable all experiments. More info here [Disable All Experiments](#disable-all-experiments).
`forcedExperiments` - (_Object [optional]_): An object with experiment key/values as experiment name/forced variant. More info here: [Forcing specific variants](#forcing-specific-variants)
`getCookie` - (_Function [optional]_): A function prop provided to retrieve a browser cookie. Required for server-side rendering.
`setCookie` - (_Function [optional]_): A function prop provided to set a browser cookie. Required for server-side rendering.

## `withTest([mapExperimentsToProps], [options])([WrappedComponent])`

- [`WrappedComponent`] - (_Function or Class_): The wrapped component you want subscribed to experiments.
- [`mapExperimentsToProps`] - (_Object_): Experiments you want to subscribe to using `key/value` pairs. The object `key` will be the what you want to name the component prop for the experiment. The `value` will be the variant/bucket chosen.
- [`options`] - (_Object [optional]_): An object that you can pass in as the third argument for extra functionality. Options are below:

  - [`updateExperiments`] - (_Boolean_): Allows you to update an experiment's variant/bucket. If this option is provided and set to `true`, you will have access to an `updateExperiments()` function prop in your wrapped components that allows you to update experiments. `this.props.updateExperiments(<UpdatedExperiments>, <callback>)` takes in an object as the first argument with `key/value` pairs. The experiment name being the `key` and the variant being the `value`. Second argument is an optional callback function you can set that will fire after experiments have been updated.

  - #### Example
    ```js
    // Updating the 'button-size' experiment with variant 'large'
    this.props.updateExperiments({
      'button-size': 'large',
    });
    ```
