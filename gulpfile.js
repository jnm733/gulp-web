const { parallel, src, dest } = require('gulp');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const prefix = require('gulp-autoprefixer');

var config = require('./gulpfile.config.json');

// Gulp task to minify and union CSS files
function minifyCSS() {
    return src(config.css.src)
        // Prefix for cross browser
        .pipe(prefix('last 2 versions'))
        //Concat all files
        .pipe(concat(config.css.concat))
        // Output
        .pipe(dest(config.css.dest))
        // Minify the file
        .pipe(cleanCSS())
        // Rename the file
        .pipe(rename(config.css.minify))
        // Output
        .pipe(dest(config.css.dest))
}

// Gulp task to minify and union JavaScript files
function minifyJS() {
    return src(config.js.src)
        //Concat all files
        .pipe(concat(config.js.concat))
        // Output
        .pipe(dest(config.js.dest))
        // Minify the file
        .pipe(uglify())
        // Rename the file
        .pipe(rename(config.js.minify))
        // Output
        .pipe(dest(config.js.dest))
}

exports.build = parallel(minifyCSS, minifyJS);