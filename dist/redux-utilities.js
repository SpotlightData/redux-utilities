(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.SRU = {})));
}(this, (function (exports) { 'use strict';

/**
 * Concatinates 2 arrays
 * @param {any[]} list1
 * @param {any[]} list2
 * @return {any[]}
 */
function concat(list1, list2) {
  return list1.concat(list2);
}
/**
 * List reduce function
 * @param {Function} fn - Modifier to be aplied
 * @param {any} initialValue
 * @param {any[]} list
 */

function reduce(fn, initialValue, list) {
  return list.reduce(fn, initialValue);
}
function validate(schema, data, options) {
  var error;

  try {
    schema.validateSync(data, options);
  } catch (e) {
    error = e;
  }

  return error;
}
function deepClone(val) {
  return JSON.parse(JSON.stringify(val));
}

/**
 * @example
 *
 * const USER = makeType('USER', ['ADD', 'REMOVE', 'UPDATE']);
 * // { UPDATE: 'USER_UPDATE', REMOVE: 'USER_REMOVE', ADD: 'USER_ADD' }
 *
 * @param {string} prefix - Prefix to the message
 * @param {string[]} types - Types to be added to the type object
 * @param {string[]} [defaultTypes] - Types to be concatinated with passed types
 * @return Object
 */

function makeType(prefix, types, defaultTypes) {
  if (defaultTypes === void 0) {
    defaultTypes = [];
  }

  return reduce(function (dict, type) {
    var _Object$assign;

    return Object.assign((_Object$assign = {}, _Object$assign[type] = prefix + "_" + type, _Object$assign), dict);
  }, {}, concat(types, defaultTypes));
}

var yup = require('yup');

var schema = yup.object().shape({
  key: yup.string().required(),
  cases: yup.object().required(),
  initialState: yup.object()
});
/**
 * @param  {Object} cases - contains handler functions for actions
 * @param  {Object} [initialState={}]
 * @return {(state: Object, action: Object): Object} basic reducer
 */

function createReducer(cases, initialState) {
  if (initialState === void 0) {
    initialState = {};
  }

  return function (state, action) {
    if (state === void 0) {
      state = initialState;
    }

    if (cases[action.type] === undefined) {
      return state;
    }

    var newState = cases[action.type](state, action);
    return Object.assign({}, state, newState);
  };
}
/**
 * Will create a configuration for reducer
 * @param  {Object} [reducer] - should contain: (key, cases, initalState)
 * @return {[key, reducer]} - reducer config that should be flatten with `flattenReducers`
 */


function applyReducer(reducer) {
  var validation = validate(schema, reducer);

  if (validation) {
    throw new Error(validation.message);
  }

  return [reducer.key, createReducer(reducer.cases, reducer.initialState)];
}

/**
 * Pass reducers made with `applyReducer` function.
 * This will flatten them,so they can be passed to `combineReducers` function
 * @param {[string, Function][]} reducers
 */

function flattenReducers(reducers) {
  return reduce(function (dict, entry) {
    var key = entry[0],
        handler = entry[1]; // Normally we'd use Object.assign, but here it would slow it down, and we don't care about overrides
    // eslint-disable-next-line

    dict[key] = handler;
    return dict;
  }, {}, reducers);
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var hoistNonReactStatics = createCommonjsModule(function (module, exports) {
  /**
   * Copyright 2015, Yahoo! Inc.
   * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
   */
  (function (global, factory) {
    module.exports = factory();
  })(commonjsGlobal, function () {
    var REACT_STATICS = {
      childContextTypes: true,
      contextTypes: true,
      defaultProps: true,
      displayName: true,
      getDefaultProps: true,
      getDerivedStateFromProps: true,
      mixins: true,
      propTypes: true,
      type: true
    };
    var KNOWN_STATICS = {
      name: true,
      length: true,
      prototype: true,
      caller: true,
      callee: true,
      arguments: true,
      arity: true
    };
    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getPrototypeOf = Object.getPrototypeOf;
    var objectPrototype = getPrototypeOf && getPrototypeOf(Object);
    return function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
      if (typeof sourceComponent !== 'string') {
        // don't hoist over string (html) components
        if (objectPrototype) {
          var inheritedComponent = getPrototypeOf(sourceComponent);

          if (inheritedComponent && inheritedComponent !== objectPrototype) {
            hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
          }
        }

        var keys = getOwnPropertyNames(sourceComponent);

        if (getOwnPropertySymbols) {
          keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        }

        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];

          if (!REACT_STATICS[key] && !KNOWN_STATICS[key] && (!blacklist || !blacklist[key])) {
            var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

            try {
              // Avoid failures from read-only properties
              defineProperty(targetComponent, key, descriptor);
            } catch (e) {}
          }
        }

        return targetComponent;
      }

      return targetComponent;
    };
  });
});

/**
 * @param  {Object} [actions] - actions that will be passed fetch and dispatch functions
 * @param  {Object} [props] - props taken from redux connect
 * @return {Object} - activated actions
 */

function mapActionsToBackEnd(actions, props, backEndConf) {
  var token = props.token,
      dispatch = props.dispatch;

  if (!(actions instanceof Object) || Array.isArray(actions)) {
    throw TypeError('Actions should be an object');
  }

  if (typeof token !== 'string') {
    throw TypeError('Token string needs to be passed');
  }

  if (!dispatch || typeof dispatch !== 'function') {
    throw TypeError('Dispatch should be a function');
  }

  var backEnd = backEndConf(token);
  return Object.keys(actions).reduce(function (mappedActions, key) {
    // eslint-disable-next-line
    mappedActions[key] = actions[key](backEnd, dispatch);
    return mappedActions;
  }, {});
}
/**
 * @param {Function} [mapFn] - function that will be applied to get actions
 * @param {Object} [actions] - all of the actions that the <code>mapFn</code> will be applied to
 * @param {Function} backEndConf - Function that the token will be passed to.
 * @param {Function} createElement - Function that will create the element
 * @param {ReactElement} [Comp] - Component to wrap
 * @return {(props) => ReactElement}
 */

var withMappedActions = function withMappedActions(mapFn, actions, backEndConf, createElement) {
  return function (Component) {
    var compName = Component.displayName || Component.name;

    var WrapperComp = function WrapperComp(props) {
      return createElement(Component, Object.assign({}, props, {
        actions: mapFn(actions, props, backEndConf)
      }));
    };

    WrapperComp.WrappedComponent = Component;
    WrapperComp.displayName = "withMappedActions(" + compName + ")";
    return hoistNonReactStatics(WrapperComp, Component);
  };
};

var yup$1 = require('yup');
/**
 * @typedef {Object} options
 * @prop {string} key
 * @prop {Object} type
 * @prop {Object} cases
 * @prop {Object} initial
 */


var schema$1 = yup$1.object().shape({
  key: yup$1.string().required(),
  type: yup$1.object().required(),
  initialState: yup$1.object(),
  cases: yup$1.object()
});
/**
 * Extends default configuration of reducers to contain basic handlers
 * (getAll, getSingle, loading, loadingDone, unmounted)
 * (Keep in mind none of these reducers override the state as they expect usage of `applyReducer`)
 * @param {options} [options]
 * @param {Function} clone - Function to clone the inital object to allow clearing it later on
 * @return {Object} []
 */

function extendDefaultReducer(config, clone) {
  var _Object$assign;

  if (clone === void 0) {
    clone = deepClone;
  }

  var validation = validate(schema$1, config);

  if (validation) {
    throw new Error(validation.message);
  }

  var key = config.key,
      type = config.type,
      cases = config.cases;
  var givenState = config.initialState || {};
  var initialState = Object.assign({
    all: [],
    current: {},
    loading: true,
    failed: false,
    unmounted: false
  }, givenState);

  function getAll(state, _ref) {
    var all = _ref.all;
    return {
      all: all,
      loading: false,
      unmounted: false
    };
  }

  function getSingle(state, _ref2) {
    var current = _ref2.current;
    return {
      current: current,
      loading: false,
      unmounted: false
    };
  }

  function loading(state, action) {
    return {
      loading: true,
      unmounted: false
    };
  }

  function loadingDone(state, action) {
    return {
      loading: false
    };
  }

  function unmounted(state, action) {
    return {
      unmounted: true
    };
  }

  function failed(state, action) {
    return {
      loading: false,
      failed: true,
      unmounted: false
    };
  }

  function clear() {
    return clone(initialState);
  }

  return {
    key: key,
    cases: Object.assign((_Object$assign = {}, _Object$assign[type.GET_ALL] = getAll, _Object$assign[type.GET_ONE] = getSingle, _Object$assign[type.LOADING] = loading, _Object$assign[type.LOADING_DONE] = loadingDone, _Object$assign[type.UNMOUNT] = unmounted, _Object$assign[type.FAILED] = failed, _Object$assign[type.CLEAR] = clear, _Object$assign), cases),
    initialState: clone(initialState)
  };
}

exports.makeType = makeType;
exports.applyReducer = applyReducer;
exports.flattenReducers = flattenReducers;
exports.withMappedActions = withMappedActions;
exports.mapActionsToBackEnd = mapActionsToBackEnd;
exports.extendDefaultReducer = extendDefaultReducer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
