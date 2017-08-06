(function (global) {
    System.config({
        paths: {
            // paths serve as alias
            'npm:': 'node_modules/',
        },

        // map tells the System loader where to look for things
        map: {
            // other libraries
            'immutable':                    'npm:immutable/dist/immutable.js',
            'moment':                       'npm:moment/moment.js',
        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            src: {
                defaultExtension: 'js',
            },
            'caesium-core': {
                defaultExtension: 'js'
            }
        },
    });
})(this);
