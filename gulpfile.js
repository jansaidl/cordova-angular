var gulp = require('gulp');
var typescript = require('gulp-tsc');
var livereload = require('gulp-livereload');

var paths = {
	sass: ['./scss/**/*.scss'],
	typescript: ['./src/ts/**/*.ts']
};

gulp.task('watch', function() {
	var server = livereload();
	gulp.watch(paths.typescript, ['typescript']).on('change', function(file) {
		server.changed(file.path);
	});;
});

gulp.task('typescript', function() {
	gulp.src('src/**/*.ts')
		.pipe(typescript({
			out: 'main.js',
			module: 'commonjs',
			target: 'es3',
			sourcemap: false,
			declaration: false,
			comments: false
		}))
		.pipe(gulp.dest('www/js/'));
});

gulp.task('default', [ 'typescript' ]);
gulp.task('dev', [ 'typescript', 'watch']);

