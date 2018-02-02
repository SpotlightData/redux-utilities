'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./redux-utilities.min.js');
} else {
  module.exports = require('./redux-utilities.js');
}
