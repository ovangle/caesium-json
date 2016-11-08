module.exports = function(config) {

    var appBase    = 'base/';       // transpiled app JS and map files
    var srcBase = 'src/';       // app source TS files
    var appAssets  = 'base/app/'; // component assets fetched by Angular's compiler

    var testBase    = 'test/';       // transpiled test JS and map files
    var testSrcBase = 'test/';       // test source TS files

    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'), // click "Debug" in browser to see it
            require('karma-htmlfile-reporter') // crashing w/ strange socket error
        ],

        customLaunchers: {
            // From the CLI. Not used here but interesting
            // chrome setup for travis CI using chromium
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        files: [
            // System.js for module loading
            'node_modules/systemjs/dist/system.src.js',

            // Polyfills
            'node_modules/core-js/client/shim.js',
            'node_modules/es6-shim/es6-shim.js',
            'node_modules/reflect-metadata/Reflect.js',

            // zone.js
            'node_modules/zone.js/dist/zone.js',
            'node_modules/zone.js/dist/long-stack-trace-zone.js',
            'node_modules/zone.js/dist/proxy.js',
            'node_modules/zone.js/dist/sync-test.js',
            'node_modules/zone.js/dist/jasmine-patch.js',
            'node_modules/zone.js/dist/async-test.js',
            'node_modules/zone.js/dist/fake-async-test.js',

            // RxJs
            { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },
            { pattern: 'node_modules/rxjs/**/*.js.map', included: false, watched: false },

            // Immutable
            { pattern: 'node_modules/immutable/dist/immutable.js', included: false, watched: false},

            // Moment
            { pattern: 'node_modules/moment/moment.js', included: false, watched: false},

            // Caesium-core
            { pattern: 'node_modules/caesium-core/**/*.js', included: false, watched: false},

            // Paths loaded via module imports:
            // Angular itself
            { pattern: 'node_modules/@angular/**/*.js', included: false, watched: false },
            { pattern: 'node_modules/@angular/**/*.js.map', included: false, watched: false },

            { pattern: 'systemjs.config.js', included: false, watched: false },
            { pattern: 'systemjs.config.extras.js', included: false, watched: false },
            'karma-test-shim.js',

            // transpiled application & spec code paths loaded via module imports
            { pattern: appBase + '**/*.js', included: false, watched: true },
            { pattern: srcBase + '**/*.js', included: false, watched: true },
            { pattern: testBase + '**/*.js', included: false, watched: true },


            // Asset (HTML & CSS) paths loaded via Angular's component compiler
            // (these paths need to be rewritten, see proxies section)
            { pattern: appBase + '**/*.html', included: false, watched: true },
            { pattern: appBase + '**/*.css', included: false, watched: true },

            // Paths for debugging with source maps in dev tools
            { pattern: srcBase + '**/*.ts', included: false, watched: false },
            { pattern: appBase + '**/*.js.map', included: false, watched: false },
            { pattern: srcBase + '**/*.ts', included: false, watched: false },
            { pattern: testBase + '**/*.js.map', included: false, watched: false }
        ],

        // Proxied base paths for loading assets
        proxies: {
            // required for component assets fetched by Angular's compiler
            "/app/": appAssets
        },

        exclude: [],
        preprocessors: {},
        // disabled HtmlReporter; suddenly crashing w/ strange socket error
        reporters: ['progress', 'kjhtml'],//'html'],

        // HtmlReporter configuration
        htmlReporter: {
            // Open this file to see results in browser
            outputFile: '_test-output/tests.html',

            // Optional
            pageTitle: 'Unit Tests',
            subPageTitle: __dirname
        },

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false
    })
}
