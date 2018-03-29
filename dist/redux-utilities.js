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
  var error = void 0;
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

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

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
function makeType(prefix, types) {
  var defaultTypes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  return reduce(function (dict, type) {
    return Object.assign(defineProperty({}, type, prefix + '_' + type), dict);
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
function createReducer(cases) {
  var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

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

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }value = Promise.resolve(value);return then ? value.then(then) : value;
}var _async = function () {
  try {
    if (isNaN.apply(null, {})) {
      return function (f) {
        return function () {
          try {
            return Promise.resolve(f.apply(this, arguments));
          } catch (e) {
            return Promise.reject(e);
          }
        };
      };
    }
  } catch (e) {}return function (f) {
    // Pre-ES5.1 JavaScript runtimes don't accept array-likes in Function.apply
    return function () {
      try {
        return Promise.resolve(f.apply(this, Array.prototype.slice.call(arguments)));
      } catch (e) {
        return Promise.reject(e);
      }
    };
  };
}();function _call(body, then, direct) {
  if (direct) {
    return then ? then(body()) : body();
  }try {
    var result = body();if (!result || !result.then) {
      result = Promise.resolve(result);
    }return then ? result.then(then) : result;
  } catch (e) {
    return Promise.reject(e);
  }
} /**
   * @param {{ open: Function }} handler - handler that will be used to show the error
   * @param {(() => promise)[]} actions - Actions to be ran
   */
var runActionsSeq = _async(function (handler, actions, shouldNotify) {
  var action = actions.shift();
  return _call(action, function (resp) {
    if (resp._error && shouldNotify) {
      handler.open(resp);
    }
    runActionsSeq(handler, actions);
    return undefined;
  });
});

/**
 * @param {{ open: Function }} handler - handler that will be used to show the error
 * @param {promise[]} actions - Actions to be ran
 */
var runActionsAsync = _async(function (handler, actions, shouldNotify) {
  return _await(Promise.all(actions), function (reqs) {
    reqs.map(function (resp) {
      if (resp._error && shouldNotify) {
        handler.open(resp);
      }
      return undefined;
    });
  });
});
/**
 * A wrapper for running redux actions. It helps to quickly notify user of any problems that occur with minimal effort.
 * If it's not syncronous:
 *  It will take array of promises,
 * else
 *  it should be an array of functions that return a promise
 *
 * @example
 * import React, { Component } from 'react';
 * import { notification } from 'antd';
 * import { runActions } from 'redux-utilities';
 *
 * const runner = runActions(notification);
 *
 * class TestComp extends Component {
 *    componentDidMount() {
 *      runner([this.props.getUsers(), this.props.getPhotos()]);
 *    }
 * }
 * // Keep in mind that actions have to allways return an object
 *
 * @param {{ open: Function }} handler
 * @param {bool} [shouldNotify=true] - Whether handler should be called if error occurs
 * @return {Functions}
 */
function runActions(handler) {
  var shouldNotify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (typeof handler.open !== 'function') {
    throw TypeError('Expected handler.open to be a function');
  }
  return function (actions) {
    var isSync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return isSync ? runActionsSeq(handler, actions, shouldNotify) : runActionsAsync(handler, actions, shouldNotify);
  };
}

/**
 * Pass reducers made with `applyReducer` function.
 * This will flatten them,so they can be passed to `combineReducers` function
 * @param {[string, Function][]} reducers
 */
function flattenReducers(reducers) {
  return reduce(function (dict, entry) {
    var _entry = slicedToArray(entry, 2),
        key = _entry[0],
        handler = _entry[1];
    // Normally we'd use Object.assign, but here it would slow it down, and we don't care about overrides
    // eslint-disable-next-line


    dict[key] = handler;
    return dict;
  }, {}, reducers);
}

/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var REACT_STATICS = {
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
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

var defineProperty$1 = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = getPrototypeOf && getPrototypeOf(Object);

var hoistNonReactStatics = function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
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
                    defineProperty$1(targetComponent, key, descriptor);
                } catch (e) {}
            }
        }

        return targetComponent;
    }

    return targetComponent;
};

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
      return createElement(Component, Object.assign({}, props, { actions: mapFn(actions, props, backEndConf) }));
    };
    WrapperComp.WrappedComponent = Component;
    WrapperComp.displayName = 'withMappedActions(' + compName + ')';
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
function extendDefaultReducer(config) {
  var _Object$assign;

  var clone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : deepClone;

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

    return { all: all, loading: false, unmounted: false };
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
      unmounted: false
    };
  }

  function clear() {
    return clone(initialState);
  }

  return {
    key: key,
    cases: Object.assign((_Object$assign = {}, defineProperty(_Object$assign, type.GET_ALL, getAll), defineProperty(_Object$assign, type.GET_ONE, getSingle), defineProperty(_Object$assign, type.LOADING, loading), defineProperty(_Object$assign, type.LOADING_DONE, loadingDone), defineProperty(_Object$assign, type.UNMOUNT, unmounted), defineProperty(_Object$assign, type.FAILED, failed), defineProperty(_Object$assign, type.CLEAR, clear), _Object$assign), cases),
    initialState: clone(initialState)
  };
}

exports.makeType = makeType;
exports.applyReducer = applyReducer;
exports.runActions = runActions;
exports.flattenReducers = flattenReducers;
exports.withMappedActions = withMappedActions;
exports.mapActionsToBackEnd = mapActionsToBackEnd;
exports.extendDefaultReducer = extendDefaultReducer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
