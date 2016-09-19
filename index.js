#!/usr/bin/env node
const commander = require('commander');
const esprima = require('esprima');
const fs = require('fs');
const package = require('./package.json');

function loadFile(filename) {
  return fs.readFileSync(filename, 'utf8');
}

function saveFile(filename, contents) {
  return fs.writeFileSync(filename, contents, 'utf8');
}

function getAst(js) {
  return esprima.parse(js);
}

function getAsyncIdentifier(ast) {
  let result;
  if (ast.type === 'Program') {
    for (let i = 0; i < ast.body.length; i++) {
      result = getAsyncIdentifier(ast.body[i]);
      if (result) break;
    }
    return result;
  } else if (ast.type === 'VariableDeclaration') {
    for (let j = 0; j < ast.declarations.length; j++) {
      result = getAsyncIdentifier(ast.declarations[j]);
      if (result) break;
    }
    return result;
  } else if (ast.type === 'VariableDeclarator') {
    if (ast.init.type === 'CallExpression') {
      if (ast.init.callee.type === 'Identifier' &&
                ast.init.callee.name === 'require' &&
                ast.init.arguments[0].type === 'Literal' &&
                ast.init.arguments[0].value === 'lib/utils') {
        return ast.id.name;
      }
    }
    return undefined;
  }

  // TODO: Handle the rest of the tree
  return undefined;
}

function findAutoSubtree(ast, asyncIdentifier) {
  let result;
  if (!asyncIdentifier) asyncIdentifier = getAsyncIdentifier(ast);

  if (ast.type === 'Program') {
    for (let i = 0; i < ast.body.length; i++) {
      result = findAutoSubtree(ast.body[i], asyncIdentifier);
      if (result) break;
    }
    return result;
  } else if (ast.type === 'VariableDeclaration') {
    for (let j = 0; j < ast.declarations.length; j++) {
      result = findAutoSubtree(ast.declarations[j], asyncIdentifier);
      if (result) break;
    }
    return result;
  } else if (ast.type === 'VariableDeclarator') {
    return ast.init ? findAutoSubtree(ast.init, asyncIdentifier) : undefined;
  } else if (ast.type === 'FunctionDeclaration') {
    for (let k = 0; k < ast.body.body.length; k++) {
      result = findAutoSubtree(ast.body.body[k], asyncIdentifier);
      if (result) break;
    }
    return result;
  } else if (ast.type === 'FunctionExpression') {
    for (let l = 0; l < ast.body.body.length; l++) {
      result = findAutoSubtree(ast.body.body[l], asyncIdentifier);
      if (result) break;
    }
    return result;
  } else if (ast.type === 'ExpressionStatement') {
    return findAutoSubtree(ast.expression, asyncIdentifier);
  } else if (ast.type === 'CallExpression') {
    if (ast.callee.type === 'SequenceExpression') {
      const possibleAuto = ast.callee.expressions[1];

      if (possibleAuto &&
            possibleAuto.object.name === asyncIdentifier &&
            possibleAuto.property.name === 'auto') {
        return ast.arguments[0];
      }
    }

    if (ast.callee.type === 'MemberExpression' &&
            ast.callee.object.name === asyncIdentifier &&
            ast.callee.property.name === 'auto') {
      return ast.arguments[0];
    }
    return undefined;
  } else if (ast.type === 'AssignmentExpression') {
    return findAutoSubtree(ast.right, asyncIdentifier);
  } else if (ast.type === 'BinaryExpression') {
    result = findAutoSubtree(ast.left, asyncIdentifier);
    if (result) return result;
    result = findAutoSubtree(ast.right, asyncIdentifier);
    return result;
  } else if (ast.type === 'ReturnStatement') {
    return findAutoSubtree(ast.argument, asyncIdentifier);
  } else if (ast.type === 'Literal') {
    return undefined;
  }
  // TODO: Handle the rest of the tree
  return undefined;
}

function buildGraphVizDotString(subAst) {
  if (subAst.type !== 'ObjectExpression') throw new Error('Does not support dynamic async.auto definitions');
  let outString = 'digraph asyncAuto {\n';
  for (let i = 0; i < subAst.properties.length; i++) {
    const property = subAst.properties[i];
    const name = property.key.name;
    if (property.value.type === 'ArrayExpression') {
      for (let j = 0; j < property.value.elements.length; j++) {
        const element = property.value.elements[j];
        if (element.type === 'Literal') {
          outString += '\t' + element.value + ' -> ' + name + ';\n';
        }
      }
    }
  }
  outString += '}\n';
  return outString;
}

function main() {
  commander
        .version(package.version)
        .option('-s, --source <file>', 'The Javascript source file to parse', String)
        .option('-d, --destination <file>', 'The GraphViz dot file to write', String)
        .parse(process.argv);

  if (!commander.source || !commander.destination) return commander.help();

  const fileContent = buildGraphVizDotString(findAutoSubtree(getAst(loadFile(commander.source))));
  // http://xkcd.com/297/

  saveFile(commander.destination, fileContent);

  return fileContent;
}

if (module === require.main) {
  main();
} else {
  module.exports = {
    loadFile,
    saveFile,
    getAst,
    getAsyncIdentifier,
    findAutoSubtree,
    buildGraphVizDotString
  };
}
