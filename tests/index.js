const async2dot = require('..');
const fs = require('fs');

let js;

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

let ast;

exports.getAst = function(test) {
  test.expect(1);
  ast = async2dot.getAst(js);
  test.equal(ast.type, 'Program');
  test.done();
};

let asyncIdentifier;

exports.getAsyncIdentifier = function(test) {
  test.expect(1);
  asyncIdentifier = async2dot.getAsyncIdentifier(ast);
  test.equal(asyncIdentifier, 'async');
  test.done();
};

let subtree;

exports.findAutoSubtree = function(test) {
  test.expect(1);
  subtree = async2dot.findAutoSubtree(ast, asyncIdentifier);
  test.equal(subtree.type, 'ObjectExpression');
  test.done();
};

exports.buildGraphVizDotString = function(test) {
  test.expect(1);
  const dotString = async2dot.buildGraphVizDotString(subtree);
  test.equal(typeof dotString, 'string');
  test.done();
};

exports.fullStack = function(test) {
  test.expect(1);
  const result = fs.readFileSync('./tests/examples/basic.dot', 'utf8');
  test.equal(
        result,
        async2dot.buildGraphVizDotString(
            async2dot.findAutoSubtree(
                async2dot.getAst(
                    async2dot.loadFile(
                        './tests/examples/basic.js'
    )))));
  test.done();
};

exports.checkPathThatIgnoresNonAsyncRequires = function(test) {
  test.expect(1);
  test.equal(
        'ObjectExpression',
        async2dot.findAutoSubtree(
            async2dot.getAst(
                async2dot.loadFile(
                    './tests/examples/multirequire.js'
        ))).type
    );
  test.done();
};

exports.throwsWhenAutoIsDynamic = function(test) {
  test.expect(1);
  test.throws(function() {
    async2dot.buildGraphVizDotString(
            async2dot.findAutoSubtree(
                async2dot.getAst(
                    async2dot.loadFile(
                        './tests/examples/dynamicauto.js'
        ))));
  });
  test.done();
};
