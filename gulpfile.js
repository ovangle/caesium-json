const gulp = require('gulp')
const typescript = require('gulp-typescript');
const del = require('del');
const series = require('series');

const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');

const karma = require('karma');


gulp.task('clean', function () {
  "use strict";
  return del('./dist')
});

gulp.task('build:es6', function () {
  "use strict";
  const tsProject = typescript.createProject('tsconfig.json');
  return gulp.src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('./dist/es6'));
});

function rollupProject() {
  return rollup({
    plugins: [
      babel(),
      nodeResolve({module: true, modulesOnly: true})
    ],
    external: ['moment', 'immutable']
  }, {
    format: 'umd',
    globals: {
      'moment': 'moment',
      'immutable': 'Immutable'
    }
  });
}

gulp.task('build:es5', ['build:es6'], function () {
  "use strict";
  return gulp.src('dist/es6/index.js')
    .pipe(rollupProject())
    .pipe(gulp.dest('dist/es5'));
})

gulp.task('build:tests', ['build:es6'], function () {
  "use strict";
  return gulp.src('dist/es6/**/*.spec.js')
    .pipe(rollupProject())
    .pipe(gulp.dest('dist/test'));
});


gulp.task('test', ['build:tests'], function (done) {
  const server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
  }, done);
  server.start();

  const watchTests = gulp.watch('src/**/*.ts', ['build:tests']);
  watchTests.on('change', function (event) {
    "use strict";
    console.log(`File ${event.path} was ${event.type}, running tasks...`);
    server.refreshFiles().then(function () {
      server.run();
    });
  });
});


