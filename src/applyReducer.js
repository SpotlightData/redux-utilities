import { validate } from './utils';

const yup = require('yup');

const schema = yup.object().shape({
  key: yup.string().required(),
  cases: yup.object().required(),
  initialState: yup.object(),
});

/**
 * @param  {Object} cases - contains handler functions for actions
 * @param  {Object} [initialState={}]
 * @return {(state: Object, action: Object): Object} basic reducer
 */
function createReducer(cases, initialState = {}) {
  return (state = initialState, action) => {
    if (cases[action.type] === undefined) {
      return state;
    }
    const newState = cases[action.type](state, action);
    return Object.assign({}, state, newState);
  };
}
/**
 * Will create a configuration for reducer
 * @param  {Object} [reducer] - should contain: (key, cases, initalState)
 * @return {[key, reducer]} - reducer config that should be flatten with `flattenReducers`
 */
export function applyReducer(reducer) {
  const validation = validate(schema, reducer);
  if (validation) {
    throw new Error(validation.message);
  }

  return [reducer.key, createReducer(reducer.cases, reducer.initialState)];
}
