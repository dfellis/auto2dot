const async = require('async');

async.auto({
  foo() {},
  bar() {},
  baz: ['foo', 'bar', function() {}],
  bay: ['baz', function() {}],
  abc: ['bay', function() {}],
  xyz: ['bay', function() {}],
  def: ['abc', function() {}],
  ijk: ['def', 'xyz', function() {}]
});
