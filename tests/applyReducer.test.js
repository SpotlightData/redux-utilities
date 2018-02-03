import { applyReducer } from '../src/applyReducer';

const testReducer = {
  key: 'test',
  cases: {
    test: () => {},
  },
};

describe('makeType', () => {
  it('should return an array', () => {
    expect(applyReducer(testReducer)).toBeInstanceOf(Array);
  });

  it('should throw for invalid config', () => {
    expect(() => {
      applyReducer();
    }).toThrow();
  });
});
