//imports + global variables
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';

const $ = gulpLoadPlugins();

var svgSprite = require('gulp-svg-sprite'),
    reload = browserSync.reload;

/* ------------- STYLE TASK -------------- */
/* --------------------------------------- */
/*  1. sass compiled to css
    2. automatic vendor prefixs
    3. combine all instances of media queries into one declaration
*/
gulp.task('styles', () => {
  var autoprefixer = require('autoprefixer'),
      pseudoContent = require('postcss-pseudo-content-insert'),
      rucksack = require('rucksack-css');

  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe( $.postcss([
        autoprefixer({browsers: ['last 2 versions', 'ie >= 11', 'Edge 13', 'Safari 7']}),
        pseudoContent,
        rucksack
      ])
    )
    .pipe($.groupCssMediaQueries())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.notify('Style task complete'))
    .pipe(reload({'stream': true}));
});

gulp.task('scss-lint', () => {
  return gulp.src(['app/styles/**/*.scss', '!app/styles/abstracts/_helpers.scss', '!app/styles/layout/_form.scss',  '!app/styles/abstract/_mixins.scss'])
    .pipe($.stylelint({
      failAfterError: false,
      reporters: [
        { formatter: 'string', console: true}
      ]
    }));
});

//config for svg sprite
const configSvgSprite = {
  mode : {
    symbol : {
      dest            : '',
      prefix          : 'icon-%s',
      sprite          : 'icons.svg'
    }
  }
}

gulp.task('svg-sprite', () => {
  gulp.src('app/images/icons/*.svg')
      .pipe($.svgSprite(configSvgSprite))
      .pipe(gulp.dest('images/'));
});

/* -- start server watch ---  */
/* -------------------------- */
gulp.task('serve', ['styles'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
    }
  });

  gulp.watch('app/styles/**/*.scss', ['styles', 'scss-lint']);
  gulp.watch('app/images/icons/*.svg', ['svg-sprite']);
});

gulp.task('build', ['styles', 'images']);


