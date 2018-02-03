import { makeType } from '../src/makeType';

describe('makeType', () => {
  it('should return object', () => {
    expect(makeType('', [])).toBeInstanceOf(Object);
  });

  it('should add prefix to object values', () => {
    const types = makeType('PREFIX', ['KEY']);
    expect(types.KEY).toBe('PREFIX_KEY');
  });

  it('should combine types with defaultTypes', () => {
    const types = makeType('PREFIX', ['KEY'], ['DEF_KEY']);
    expect(types.KEY).toBe('PREFIX_KEY');
    expect(types.DEF_KEY).toBe('PREFIX_DEF_KEY');
  });
});
