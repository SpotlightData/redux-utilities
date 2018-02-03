import { concat, reduce } from './utils';

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
export function makeType(prefix, types, defaultTypes = []) {
  return reduce(
    (dict, type) => Object.assign({ [type]: `${prefix}_${type}` }, dict),
    {},
    concat(types, defaultTypes)
  );
}
