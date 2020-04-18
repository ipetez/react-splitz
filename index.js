if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react-splitz.production.min.js');
} else {
  module.exports = require('./cjs/react-splitz.development.js');
}
