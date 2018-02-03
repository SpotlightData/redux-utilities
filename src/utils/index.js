/**
 * Concatinates 2 arrays
 * @param {any[]} list1
 * @param {any[]} list2
 * @return {any[]}
 */
export function concat(list1, list2) {
  return list1.concat(list2);
}

/**
 * List reduce function
 * @param {Function} fn - Modifier to be aplied
 * @param {any} initialValue
 * @param {any[]} list
 */
export function reduce(fn, initialValue, list) {
  return list.reduce(fn, initialValue);
}

export function validate(schema, data, options) {
  if (process.env.NODE_ENV === 'production') {
    return undefined;
  }
  let error;
  try {
    schema.validateSync(data, options);
  } catch (e) {
    error = e;
  }
  return error;
}
