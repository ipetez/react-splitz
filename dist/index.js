'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./main.production.min.js');
} else {
  module.exports = require('./main.development.js');
}
