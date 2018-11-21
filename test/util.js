import { randomIntBetween } from '../src/util';

describe('util functions', () => {
  it('should be less than 1', () => {
    const num = randomIntBetween();
    console.log('==> num', num);
    expect(num <= 1).toBe(true);
  });
});
