import { deepClone, validate } from './utils';

const yup = require('yup');
/**
 * @typedef {Object} options
 * @prop {string} key
 * @prop {Object} type
 * @prop {Object} cases
 * @prop {Object} initial
 */
const schema = yup.object().shape({
  key: yup.string().required(),
  type: yup.object().required(),
  initialState: yup.object(),
  cases: yup.object(),
});

/**
 * Extends default configuration of reducers to contain basic handlers
 * (getAll, getSingle, loading, loadingDone, unmounted)
 * (Keep in mind none of these reducers override the state as they expect usage of `applyReducer`)
 * @param {options} [options]
 * @param {Function} clone - Function to clone the inital object to allow clearing it later on
 * @return {Object} []
 */
export function extendDefaultReducer(config, clone = deepClone) {
  const validation = validate(schema, config);
  if (validation) {
    throw new Error(validation.message);
  }

  const { key, type, cases } = config;
  const givenState = config.initialState || {};

  const initialState = Object.assign(
    {
      all: [],
      current: {},
      loading: true,
      failed: false,
      unmounted: false,
    },
    givenState
  );

  function getAll(state, { all }) {
    return { all, loading: false, unmounted: false };
  }

  function getSingle(state, { current }) {
    return {
      current,
      loading: false,
      unmounted: false,
    };
  }

  function loading(state, action) {
    return { loading: true, unmounted: false };
  }

  function loadingDone(state, action) {
    return { loading: false };
  }

  function unmounted(state, action) {
    return { unmounted: true };
  }

  function failed(state, action) {
    return {
      loading: false,
      failed: true,
      unmounted: false,
    };
  }

  function clear() {
    return clone(initialState);
  }

  return {
    key,
    cases: Object.assign(
      {
        [type.GET_ALL]: getAll,
        [type.GET_ONE]: getSingle,
        [type.LOADING]: loading,
        [type.LOADING_DONE]: loadingDone,
        [type.UNMOUNT]: unmounted,
        [type.FAILED]: failed,
        [type.CLEAR]: clear,
      },
      cases
    ),
    initialState: clone(initialState),
  };
}
