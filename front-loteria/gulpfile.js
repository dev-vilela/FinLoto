// Gulpfile atualizado para Node 22 e del v6
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const pkg = require('./package.json');

// Banner no topo dos arquivos minificados
const banner = [
  '/*!',
  ' * <%= pkg.title %> v<%= pkg.version %>',
  ' * Copyright ' + new Date().getFullYear() + ' <%= pkg.author %>',
  ' * Licensed under <%= pkg.license %>',
  ' */',
  '',
].join('\n');

// Caminhos principais
const paths = {
  scss: './scss/**/*.scss',
  css: './css',
  js: './js/**/*.js',
  vendor: './vendor',
};

// Limpar pasta vendor
function clean() {
  return del(['./vendor/**', '!./vendor']);
}

// Copiar dependências para vendor/
function modules() {
  // Bootstrap
  gulp.src('./node_modules/bootstrap/dist/**/*')
    .pipe(gulp.dest(paths.vendor + '/bootstrap'));
  // jQuery
  gulp.src([
    './node_modules/jquery/dist/*',
    '!./node_modules/jquery/dist/core.js'
  ]).pipe(gulp.dest(paths.vendor + '/jquery'));
  // Font Awesome
  gulp.src('./node_modules/@fortawesome/**/*')
    .pipe(gulp.dest(paths.vendor + '/@fortawesome'));
  // Datatables
  gulp.src([
    './node_modules/datatables.net/js/*.js',
    './node_modules/datatables.net-bs4/js/*.js',
    './node_modules/datatables.net-bs4/css/*.css'
  ]).pipe(gulp.dest(paths.vendor + '/datatables'));
  // Chart.js
  gulp.src('./node_modules/chart.js/dist/*.js')
    .pipe(gulp.dest(paths.vendor + '/chart.js'));
  return Promise.resolve();
}

// Compilar SCSS
function css() {
  return gulp
    .src('./scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.css))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cleanCSS())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.stream());
}

// Minificar JS
function js() {
  return gulp
    .src(['./js/*.js', '!./js/*.min.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
}

// BrowserSync
function serve() {
  browserSync.init({
    server: { baseDir: './' }
  });
  gulp.watch(paths.scss, css);
  gulp.watch(paths.js, js);
  gulp.watch('./*.html').on('change', browserSync.reload);
}

// Tarefas principais
gulp.task('clean', clean);
gulp.task('modules', modules);
gulp.task('css', css);
gulp.task('js', js);
gulp.task('serve', gulp.series(css, js, serve));
gulp.task('watch', gulp.series(clean, modules, css, js, serve));

gulp.task('default', gulp.series('watch'));
