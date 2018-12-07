export const experimentConfig = [
  {
    name: 'button-size',
    variants: [
      { name: 'default', weight: 0.1 },
      { name: 'small', weight: 0.2 },
      { name: 'medium', weight: 0.3 },
      { name: 'big', weight: 0.4 },
    ],
  },
  {
    name: 'button-color',
    variants: [
      { name: 'default' },
      { name: 'red' },
      { name: 'white' },
      { name: 'blue' },
    ],
  },
  {
    name: 'recommended-content',
    variants: [{ name: 'recommend' }, { name: 'default' }],
  },
];

export const experimentState = {
  [experimentConfig[0].name]: {
    name: experimentConfig[0].name,
    chosenVariantName: 'small',
    variants: experimentConfig[0].variants,
  },
  [experimentConfig[1].name]: {
    name: experimentConfig[1].name,
    chosenVariantName: 'red',
    variants: experimentConfig[1].variants,
  },
  [experimentConfig[2].name]: {
    name: experimentConfig[1].name,
    chosenVariantName: 'recommend',
    variants: experimentConfig[2].variants,
  },
};
