const foo = require('bar');
const async = require('async');

function blah() {
  return foo.blah() * 2;
}

module.exports = function transpiledOutput(abc, callback) {
  (0, async.auto)({
    a: foo.a,
    b: foo.b,
    c: ['a', 'b', foo.c],
    d: ['c', foo.d],
    e: ['b', foo.e],
    f: ['d', 'e', foo.f],
    g: ['f', blah]
  }, callback);
};
