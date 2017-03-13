// #docregion
// /*global jasmine, __karma__, window*/
Error.stackTraceLimit = 0; // "No stacktrace"" is usually best for app testing.

// Uncomment to get full stacktrace output. Sometimes helpful, usually not.
// Error.stackTraceLimit = Infinity; //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

var builtPath = '/base/';

__karma__.loaded = function () { };

function isJsFile(path) {
    return path.slice(-3) == '.js';
}

function isSpecFile(path) {
    return /\.spec\.(.*\.)?js$/.test(path);
}

function isBuiltFile(path) {
    return isJsFile(path) && (path.substr(0, builtPath.length) == builtPath);
}

var allSpecFiles = Object.keys(window.__karma__.files)
    .filter(isSpecFile)
    .filter(isBuiltFile);

System.config({
    baseURL: 'base',
    // Extend usual application package list with test folder
    packages: { 'testing': { main: 'index.js', defaultExtension: 'js' } },
});

System.import('systemjs.config.js')
    .then(importSystemJsExtras)
    .then(initTesting);

/** Optional SystemJS configuration extras. Keep going w/o it */
function importSystemJsExtras(){
    return System.import('systemjs.config.extras.js')
        .catch(function(reason) {
            console.log(
                'Warning: System.import could not load the optional "systemjs.config.extras.js". Did you omit it by accident? Continuing without it.'
            );
            console.log(reason);
        });
}


// Import all spec files and start karma
function initTesting () {
    jasmine.MAX_PRETTY_PRINT_DEPTH = 2;
    return Promise.all(
        allSpecFiles.map(function (moduleName) {
            return System.import(moduleName);
        })
    )
        .then(__karma__.start, __karma__.error);
}


// TODO: Temporary hack to add a '_url' property to XHR.
var xhrProto = XMLHttpRequest.prototype,
    origOpen = xhrProto.open;

xhrProto.open = function (method, url) {
    this._url = url;
    return origOpen.apply(this, arguments);
};
