var commander = require('commander');
var esprima = require('esprima');
var fs = require('fs');
var package = require('./package.json');

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
    var result;
    if (ast.type === 'Program') {
        for (var i = 0; i < ast.body.length; i++) {
            result = getAsyncIdentifier(ast.body[i]);
            if (result) break;
        }
        return result;
    } else if (ast.type === 'VariableDeclaration') {
        for (var j = 0; j < ast.declarations.length; j++) {
            result = getAsyncIdentifier(ast.declarations[j]);
            if (result) break;
        }
        return result;
    } else if (ast.type === 'VariableDeclarator') {
        if (ast.init.type === 'CallExpression') {
            if (ast.init.callee.type === 'Identifier' &&
                ast.init.callee.name === 'require' &&
                ast.init.arguments[0].type === 'Literal' &&
                ast.init.arguments[0].value === 'async') {
                return ast.id.name;
            }
        }
        return undefined;
    } else {
        // TODO: Handle the rest of the tree
        return undefined;
    }
}

function findAutoSubtree(ast, asyncIdentifier) {
    var result;
    if (!asyncIdentifier) asyncIdentifier = getAsyncIdentifier(ast);
    if (ast.type === 'Program') {
        for (var i = 0; i < ast.body.length; i++) {
            result = findAutoSubtree(ast.body[i], asyncIdentifier);
            if (result) break;
        }
        return result;
    } else if (ast.type === 'VariableDeclaration') {
        for (var j = 0; j < ast.declarations.length; j++) {
            result = findAutoSubtree(ast.declarations[j], asyncIdentifier);
            if (result) break;
        }
        return result;
    } else if (ast.type === 'VariableDeclarator') {
        return ast.init ? findAutoSubtree(ast.init, asyncIdentifier) : undefined;
    } else if (ast.type === 'FunctionDeclaration') {
        for (var k = 0; k < ast.body.body.length; k++) {
            result = findAutoSubtree(ast.body.body[k], asyncIdentifier);
            if (result) break;
        }
        return result;
    } else if (ast.type === 'ExpressionStatement') {
        return findAutoSubtree(ast.expression, asyncIdentifier);
    } else if (ast.type === 'CallExpression') {
        if (ast.callee.type === 'MemberExpression' &&
            ast.callee.object.name === asyncIdentifier &&
            ast.callee.property.name === 'auto') {
            return ast.arguments[0];
        }
        return undefined;
    } else {
        // TODO: Handle the rest of the tree
        return undefined;
    }
}

function buildGraphVizDotString(subAst) {
    if (subAst.type !== 'ObjectExpression') throw new Error('Does not support dynamic async.auto definitions');
    var outString = 'digraph asyncAuto {\n';
    for (var i = 0; i < subAst.properties.length; i++) {
        var property = subAst.properties[i];
        var name = property.key.name;
        if (property.value.type === 'ArrayExpression') {
            for (var j = 0; j < property.value.elements.length; j++) {
                var element = property.value.elements[j];
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

    saveFile(
        commander.destination,
        buildGraphVizDotString(
            findAutoSubtree(
                getAst(
                    loadFile(
                        commander.source
    ))))); // http://xkcd.com/297/
}

if (module === require.main) {
    main();
} else {
    module.exports = {
        loadFile: loadFile,
        saveFile: saveFile,
        getAst: getAst,
        findAutoSubtree: findAutoSubtree,
        buildGraphVizDotString: buildGraphVizDotString
    };
}