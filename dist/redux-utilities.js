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
    var _Object$assign;

    return Object.assign((_Object$assign = {}, _Object$assign[type] = prefix + '_' + type, _Object$assign), dict);
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
  var error = validate(schema, reducer);
  if (error) {
    throw new Error(error.message);
  }

  return [reducer.key, createReducer(reducer.cases, reducer.initialState)];
}

/**
 * @param {{ open: Function }} handler - handler that will be used to show the error
 * @param {(() => promise)[]} actions - Actions to be ran
 */
async function runActionsSeq(handler, actions, shouldNotify) {
  var action = actions.shift();
  var resp = await action();
  if (resp._error && shouldNotify) {
    handler.open(resp);
  }
  runActionsSeq(handler, actions);
  return undefined;
}

/**
 * @param {{ open: Function }} handler - handler that will be used to show the error
 * @param {promise[]} actions - Actions to be ran
 */
async function runActionsAsync(handler, actions, shouldNotify) {
  var reqs = await Promise.all(actions);
  reqs.map(function (resp) {
    if (resp._error && shouldNotify) {
      handler.open(resp);
    }
    return undefined;
  });
}
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
    var key = entry[0],
        handler = entry[1];
    // Normally we'd use Object.assign, but here it would slow it down, and we don't care about overrides
    // eslint-disable-next-line

    dict[key] = handler;
    return dict;
  }, {}, reducers);
}

exports.makeType = makeType;
exports.applyReducer = applyReducer;
exports.runActions = runActions;
exports.flattenReducers = flattenReducers;

Object.defineProperty(exports, '__esModule', { value: true });

})));
