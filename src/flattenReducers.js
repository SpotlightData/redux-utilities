import { reduce } from './utils';
/**
 * Pass reducers made with `applyReducer` function.
 * This will flatten them,so they can be passed to `combineReducers` function
 * @param {[string, Function][]} reducers
 */
export function flattenReducers(reducers) {
  return reduce(
    (dict, entry) => {
      const [key, handler] = entry;
      // Normally we'd use Object.assign, but here it would slow it down, and we don't care about overrides
      // eslint-disable-next-line
      dict[key] = handler;
      return dict;
    },
    {},
    reducers
  );
}
