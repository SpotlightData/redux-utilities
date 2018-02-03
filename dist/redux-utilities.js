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
  let error;
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
function makeType(prefix, types, defaultTypes = []) {
  return reduce(
    (dict, type) => Object.assign({ [type]: `${prefix}_${type}` }, dict),
    {},
    concat(types, defaultTypes)
  );
}

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
function applyReducer(reducer) {
  const error = validate(schema, reducer);
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
  const action = actions.shift();
  const resp = await action();
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
  const reqs = await Promise.all(actions);
  reqs.map(resp => {
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
function runActions(handler, shouldNotify = true) {
  if (typeof handler.open !== 'function') {
    throw TypeError('Expected handler.open to be a function');
  }
  return (actions, isSync = false) =>
    isSync
      ? runActionsSeq(handler, actions, shouldNotify)
      : runActionsAsync(handler, actions, shouldNotify);
}

/**
 * Pass reducers made with `applyReducer` function.
 * This will flatten them,so they can be passed to `combineReducers` function
 * @param {[string, Function][]} reducers
 */
function flattenReducers(reducers) {
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

var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = getPrototypeOf && getPrototypeOf(Object);

var hoistNonReactStatics = function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components

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
                try { // Avoid failures from read-only properties
                    defineProperty(targetComponent, key, descriptor);
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

/**
 * @param {Function} [mapFn] - function that will be applied to get actions
 * @param {Object} [actions] - all of the actions that the <code>mapFn</code> will be applied to
 * @param {Function} backEndConf - Function that the token will be passed to.
 * @param {Function} createElement - Function that will create the element
 * @param {ReactElement} [Comp] - Component to wrap
 * @return {(props) => ReactElement}
 */
const withMappedActions = (
  mapFn,
  actions,
  backEndConf,
  createElement
) => Component => {
  const compName = Component.displayName || Component.name;
  const WrapperComp = props =>
    createElement(
      Component,
      Object.assign({}, props, { actions: mapFn(actions, props, backEndConf) })
    );
  WrapperComp.WrappedComponent = Component;
  WrapperComp.displayName = `withMappedActions(${compName})`;
  return hoistNonReactStatics(WrapperComp, Component);
};

exports.makeType = makeType;
exports.applyReducer = applyReducer;
exports.runActions = runActions;
exports.flattenReducers = flattenReducers;
exports.withMappedActions = withMappedActions;

Object.defineProperty(exports, '__esModule', { value: true });

})));
