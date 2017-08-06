module.exports = function(config) {
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

            // Immutable
            { pattern: 'node_modules/immutable/dist/immutable.js', included: true, watched: false},

            // Moment
            { pattern: 'node_modules/moment/moment.js', included: true, watched: false},

            { pattern: 'systemjs.config.js', included: false, watched: false },
            'karma-test-shim.js',

            {pattern: 'dist/test/**/*.js', included: true, watched: false},
       ],

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
