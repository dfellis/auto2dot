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

function findAutoSubtree(ast) {
    var body = ast.body;
    var asyncIdentifier;
    var autoObj;
    while (!asyncIdentifier && !autoObj) {
        // TODO: Write code to first find a variable declaration for the async object
        // assuming that it comes first, then look for an `async.auto` call and
        // return its first argument (the object that declares the dependency tree)
        // TODO TODO: if we actually have a reference to the dependency tree
    }
}

function buildGraphVizDotString(subAst) {

}

function main() {
    commander
        .version(package.version)
        .option('-s, --source', 'The Javascript source file to parse', String)
        .option('-d, --destination', 'The GraphViz dot file to write', String)
        .parse(process.argv);

    if (!commander.source || !commander.destination) return commander.help();

    saveFile(
        commander.destination,
        buildGraphVizDotString(
            findAutoSubtree(
                getAst(
                    loadFile(
                        commander.source
                    )
                )
            )
        )
    ); // http://xkcd.com/297/
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