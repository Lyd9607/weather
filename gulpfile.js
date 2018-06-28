'use strict'
const gulp = require('gulp')

gulp.task('build', () => {
  gulp.src(['node_modules/bootstrap/dist/*/*.min.*', 'app/*/*.*', 'app/*.*'])
      .pipe(gulp.dest('build'))

  gulp.src(['node_modules/jquery/dist/jquery.min.*', 'node_modules/later/later.min.*'])
      .pipe(gulp.dest('build/js'))
})

gulp.task('default', () => {
  gulp.watch(['app/*/*.*', 'app/*.*', 'app/_locales/*/*.*'], ['build']);
});