var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    concatCss = require('gulp-concat-css');

    

gulp.task('clean', function(cb) {
    del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img'], cb)
});


gulp.task('watch', function() {
  gulp.watch('src/scripts/**/*.js', ['scripts']);// Watch .js files
 // gulp.watch('src/images/**/*', ['images']);
});


////////////////////////////////////////////////////////
/////////////////// working part ///////////////////////

gulp.task('scripts', function() {
  return gulp.src('dist/js/**/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('build/assets/'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('mini-concat-css', function() {
  return gulp.src('dist/css/*.css')
    .pipe(concatCss("bundle.css"))
    .pipe(minifycss({compatibility: 'ie8'}))
    .pipe(gulp.dest('build/assets/'));
});

gulp.task('watch', function() {  

  gulp.watch('dist/js/**', ['scripts']);
  gulp.watch('dist/css/**', ['mini-concat-css']);

   connect.server({
    livereload: true,
    port : 5555
  });

  gulp.watch(['dist/**']).on('change', livereload.changed);
});


