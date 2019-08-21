// load all dependencies. gulp-* dependencies are
// all loaded at once by gulp-load-plugins
var gulp = require("gulp");
var del = require("del");
var plugins = require("gulp-load-plugins")();
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var cssmqpacker = require("css-mqpacker");
var uncss = require("postcss-uncss");
var pngquant = require("imagemin-pngquant");
var mozjpeg = require("imagemin-mozjpeg");
var ghPages = require('gulp-gh-pages');

// define source and destination paths
var paths = {
  styles: {
    src: "src/scss/**/*.scss",
    dest: "dist/css"
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "dist/js"
  },
  images: {
    src: "src/img/**/*.{jpg,jpeg,png,svg}",
    dest: "dist/img"
  },
  static: {
    src: "src/**/*.{php,html,ini,htaccess,xml,ico,json}",
    dest: "dist"
  }
};

// define the processors to be run within postcss
var postcssProcessors = [
  autoprefixer(),
  cssnano(),
  cssmqpacker()
];

// set the image compression options
var imgOptions = [
  mozjpeg({
    quality: "86"
  }),
  pngquant({
    quality: [0.7, 0.8]
  })
];

// Styles Processing function. Check for changes, process SASS
// minify, group media queries and remove unused selectors
function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(plugins.changed(paths.styles.dest))
    .pipe(plugins.sass())
    .pipe(plugins.postcss(postcssProcessors))
    .pipe(gulp.dest(paths.styles.dest));
}

// cleaning function. Will usually only be run before build.
function clean() {
  return del(["dist/.*", "dist/**/*"]).then(paths => {
    console.log("Deleted files and folders:\n", paths.join("\n"));
  });
}

// concatenate and uglify javascript
function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(plugins.changed(paths.scripts.dest))
    .pipe(plugins.concat("site.js"))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(paths.scripts.dest));
}

// processing images
function images() {
  return gulp
    .src(paths.images.src)
    .pipe(plugins.changed(paths.images.dest))
    .pipe(plugins.imagemin(imgOptions, {
      verbose: true
    }))
    .pipe(gulp.dest(paths.images.dest));
}

// copy static files, specifically including dot files like .htaccess.
function static() {
  return gulp
    .src(paths.static.src, {
      dot: true
    })
    .pipe(plugins.changed(paths.static.dest))
    .pipe(gulp.dest(paths.static.dest));
}

// watch task
function watch() {
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.static.src, static);
}

//define build process, whether tasks run in parallel or series.
var build = gulp.series(clean, static, gulp.parallel(styles, scripts, images));

//define standalone tasks
gulp.task("styles", styles);
gulp.task("clean", clean);
gulp.task("scripts", scripts);
gulp.task("images", images);
gulp.task("static", static);
gulp.task("watch", watch);

//define build and also set default task as build
gulp.task("build", build);
gulp.task("default", build);