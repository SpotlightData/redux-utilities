import hoistStatics from 'hoist-non-react-statics';

/**
 * @param  {Object} [actions] - actions that will be passed fetch and dispatch functions
 * @param  {Object} [props] - props taken from redux connect
 * @return {Object} - activated actions
 */
export function mapActionsToBackEnd(actions, props, backEndConf) {
  const { token, dispatch } = props;

  if (!(actions instanceof Object) || Array.isArray(actions)) {
    throw TypeError('Actions should be an object');
  }
  if (typeof token !== 'string') {
    throw TypeError('Token string needs to be passed');
  }
  if (!dispatch || typeof dispatch !== 'function') {
    throw TypeError('Dispatch should be a function');
  }
  const backEnd = backEndConf(token);
  return Object.keys(actions).reduce((mappedActions, key) => {
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
export const withMappedActions = (
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
  return hoistStatics(WrapperComp, Component);
};
