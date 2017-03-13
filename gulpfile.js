let gulp = require('gulp')
let typescript = require('gulp-typescript');
let del = require('del');
var series = require('series');

var rollup = require('gulp-better-rollup');

let tsProject = typescript.createProject('tsconfig.json', {
  module: 'es2015'
});

gulp.task('clean', function () {
  "use strict";
  return series([
    del('./lib'),
    del('./bundles')
  ]);
})

/**
 * Clean all test files from the lib folder
 */
gulp.task('clean:spec', ['build:scripts'], function () {
  "use strict";
  return series([
    del('./lib/**/*.spec.js'),
    del('./lib/**/*.spec.d.ts')
  ]);

});

gulp.task('build:scripts', function () {
  "use strict";

  return gulp.src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('./lib'));
});

gulp.task(
  'build:rollup',
  ['build:scripts', 'clean:spec'],
  function () {
    "use strict";
    var globals = {
      'immutable': 'Immutable',
      'moment': 'moment',

      'caesium-core/lang': 'cs.core.lang',
      'caesium-core/converter': 'cs.core.converter',
      'caesium-core/codec': 'cs.core.codec',
      'caesium-core/exception': 'cs.core.exception'
    }

    var rollupOptions = {
      context: 'this',
      external: Object.keys(globals)
    };

    var rollupGenerateOptions = {
      moduleId: '',
      moduleName: 'cs.model',
      format: 'umd',
      globals,
      dest: 'caesium-model.umd.js'
    }

    return gulp.src('lib/index.js')
      .pipe(rollup(rollupOptions, rollupGenerateOptions))
      .pipe(gulp.dest('bundles'));
  }
)
