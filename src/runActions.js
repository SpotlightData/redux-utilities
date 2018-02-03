/**
 * @param {{ open: Function }} handler - handler that will be used to show the error
 * @param {(() => promise)[]} actions - Actions to be ran
 */
export async function runActionsSeq(handler, actions, shouldNotify) {
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
export async function runActionsAsync(handler, actions, shouldNotify) {
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
export function runActions(handler, shouldNotify = true) {
  if (typeof handler.open !== 'function') {
    throw TypeError('Expected handler.open to be a function');
  }
  return (actions, isSync = false) =>
    isSync
      ? runActionsSeq(handler, actions, shouldNotify)
      : runActionsAsync(handler, actions, shouldNotify);
}
