var async2dot = require('..');
var fs = require('fs');

var js;

exports.loadFile = function(test) {
    test.expect(1);
    js = async2dot.loadFile('./tests/examples/basic.js');
    test.equal(js, fs.readFileSync('./tests/examples/basic.js', 'utf8'));
    test.done();
};

exports.saveFile = function(test) {
    test.expect(1);
    async2dot.saveFile('./tests/examples/foo', 'bar');
    test.equal('bar', fs.readFileSync('./tests/examples/foo', 'utf8'));
    fs.unlinkSync('./tests/examples/foo');
    test.done();
};

var ast;

exports.getAst = function(test) {
    test.expect(1);
    ast = async2dot.getAst(js);
    test.equal(ast.type, 'Program');
    test.done();
};

var asyncIdentifier;

exports.getAsyncIdentifier = function(test) {
    test.expect(1);
    asyncIdentifier = async2dot.getAsyncIdentifier(ast);
    test.equal(asyncIdentifier, 'async');
    test.done();
};

var subtree;

exports.findAutoSubtree = function(test) {
    test.expect(1);
    subtree = async2dot.findAutoSubtree(ast, asyncIdentifier);
    test.equal(subtree.type, 'ObjectExpression');
    test.done();
};

exports.buildGraphVizDotString = function(test) {
    test.expect(1);
    var dotString = async2dot.buildGraphVizDotString(subtree);
    test.equal(typeof dotString, 'string');
    test.done();
};
