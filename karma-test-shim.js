// #docregion
// /*global jasmine, __karma__, window*/
Error.stackTraceLimit = 0; // "No stacktrace"" is usually best for app testing.

// Uncomment to get full stacktrace output. Sometimes helpful, usually not.
// Error.stackTraceLimit = Infinity; //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

__karma__.loaded = function () { };

const specFiles = Object.keys(window.__karma__.files)
  .filter(path => /\.spec\.js$/.test(path))


System.config({
    baseURL: 'base',
    // Extend usual application package list with test folder
    packages: { 'testing': { main: 'index.js', defaultExtension: 'js' } },
});

System.import('systemjs.config.js')
    .then(initTesting);

// Import all spec files and start karma
function initTesting (changedFiles) {
    jasmine.MAX_PRETTY_PRINT_DEPTH = 2;

    return Promise.all(specFiles.map((moduleName) => System.import(moduleName)))
        .then(__karma__.start, __karma__.error);
}
