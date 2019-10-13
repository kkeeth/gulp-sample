const {src, dest, watch, series, parallel} = require('gulp'),
      del          = require('del'),
      sass         = require('gulp-sass'),
      minifycss    = require('gulp-clean-css'),
      uglify       = require('gulp-uglify'),
      babel        = require('gulp-babel'),
      eslint       = require('gulp-eslint'),
      concat       = require('gulp-concat'),
      rename       = require('gulp-rename'),
      imagemin     = require('gulp-imagemin'),
      plumber      = require('gulp-plumber'),
      pngquant     = require('imagemin-pngquant'),
      run_sequence = require('run-sequence')

const opts = {
   path: {
               js: 'src/js',
            style: 'src/scss',
           images: 'src/images',
             dist: 'dist',
          dist_js: 'dist/js',
         dist_css: 'dist/css',
      dist_images: 'dist/images'
   },
   min_suffix: '.min',
   base_name: 'all'
}

// delete
const clean = () => {
   return del(opts.path.dist)
}

// sass
const compileSass = () => {
   return src(`${opts.path.style}/**/*.scss`)
      .pipe(sass({
         outputStyle: 'expanded'
      })).on('error', sass.logError)
      .pipe(concat(`${opts.base_name}.css`))
      .pipe(minifycss())
      .pipe(rename({suffix: opts.min_suffix}))
      .pipe(dest(opts.path.dist_css))
}

// js
const compileJs = () => {
   return src(`${opts.path.js}/**/*.js`)
      .pipe(plumber({
         errorHandler: (error) => {
            const task_name = 'build js'
            const title = `[task] ${task_name} error.plugin`
            const error_msg = `error: ${error.message}`
            console.error(`${title} \n${error_msg}`)
         }
      }))
      .pipe(babel({
         presets:['env']
      }))
      .pipe(eslint({ useEslintrc: false }))
      .pipe(eslint.format())
      .pipe(concat(`${opts.base_name}.js`))
      .pipe(uglify())
      .pipe(rename({suffix: opts.min_suffix}))
      .pipe(dest(opts.path.dist_js))
}

// images
const compileImage = () => {
   return src(`${opts.path.images}/**/*.(jpg|gif|png)`)
      .pipe(imagemin({
         use: [
            pngquant({
               quality: 60 - 80,
               speed: 1
            })
         ]
      }))
      .pipe(dest(opts.path.dist_images))
}

// test run
const runTest = () => {
   // TODO write test codes
   console.log('gulp run !!\n')
}

const watchFiles = () => {
   watch(`${opts.path.js}/**/*.js`, compileJs),
   watch(`${opts.path.style}/**/*.scss`, compileSass),
   watch(`${opts.path.images}/**/*`, compileImage)
}

// build
exports.build = series(
   clean,
   parallel(compileJs, compileSass, compileImage)
)

// default
exports.default = series(
   clean,
   parallel(compileJs, compileSass, compileImage),
   watchFiles
)
