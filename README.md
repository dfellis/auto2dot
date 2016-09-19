[![NPM version](https://badge.fury.io/js/auto2dot.svg)](http://badge.fury.io/js/auto2dot)
[![Build Status](https://travis-ci.org/duereg/auto2dot.svg?branch=master)](https://travis-ci.org/duereg/auto2dot)
[![Coverage Status](https://coveralls.io/repos/duereg/auto2dot/badge.png?branch=master)](https://coveralls.io/r/duereg/auto2dot?branch=master)

# auto2dot

Parse async.auto out of a JS file and generate GraphViz .dot files

Convert this:

```js
var async = require('async');

async.auto({
    foo: function() {},
    bar: function() {},
    baz: ['foo', 'bar', function() {}],
    bay: ['baz', function() {}],
    abc: ['bay', function() {}],
    xyz: ['bay', function() {}],
    def: ['abc', function() {}],
    ijk: ['def', 'xyz', function() {}]
});
```

Into this:

```dot
digraph asyncAuto {
	foo -> baz;
	bar -> baz;
	baz -> bay;
	bay -> abc;
	bay -> xyz;
	abc -> def;
	def -> ijk;
	xyz -> ijk;
}
```

![Graph Visualization](https://raw.githubusercontent.com/duereg/auto2dot/master/tests/examples/basic.png)

## Install

    npm install auto2dot

## Usage

      Usage: auto2dot [options]

        Options:

            -h, --help                output usage information
            -V, --version             output the version number
            -s, --source <file>       The Javascript source file to parse
            -d, --destination <file>  The GraphViz dot file to write

## License (MIT)

Copyright (C) 2016 by David Ellis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
