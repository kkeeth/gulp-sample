const gulp         = require('gulp'),
      sass         = require('gulp-sass'),
      minifycss    = require('gulp-minify-css'),
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

// sass
gulp.task('css', () => {
   return gulp.src(`${opts.path.style}/**/*.scss`)
      .pipe(sass({
         outputStyle: 'expanded'
      })).on('error', sass.logError)
      .pipe(concat(`${opts.base_name}.css`))
      .pipe(minifycss())
      .pipe(rename({suffix: opts.min_suffix}))
      .pipe(gulp.dest(opts.path.dist_css))
})

// js
gulp.task('js', () => {
   return gulp.src(`${opts.path.js}/**/*.js`)
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
      .pipe(gulp.dest(opts.path.dist_js))
})

// images
gulp.task('image', () => {
   return gulp.src(`${opts.path.images}/**/*.(jpg|gif|png)`)
      .pipe(imagemin({
         use: [
            pngquant({
               quality: 60 - 80,
               speed: 1
            })
         ]
      }))
      .pipe(gulp.dest(opts.path.dist_images))
})

// test run
gulp.task('test', () => {
   console.log('gulp run !!\n')
})

// watch
gulp.task('watch', () => {
   gulp.watch(`${opts.path.js}/**/*.js`, ['js'])
   gulp.watch(`${opts.path.style}/**/*.scss`, ['css'])
   gulp.watch(`${opts.path.images}/**/*`, ['image'])
})

// default
gulp.task('default', () => {
   return run_sequence(
      'js',
      'css',
      'image'
   )
})
