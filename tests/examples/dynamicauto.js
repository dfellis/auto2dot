const async = require('async');

module.exports = function autoWrapper(steps, callback) {
  async.auto(steps, callback);
};
