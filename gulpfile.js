const {
  src,
  dest,
  series,
  watch,
  parallel,
  lastRun
} = require('gulp')
const less = require('gulp-less');
const rename = require('gulp-rename');
const del = require('del');
const imagemin = require('gulp-imagemin');
const path = require('path');
const eslint = require('gulp-eslint');
const srcPath = './src/**';
const distPath = './dist/'
const wxmlFiles = [`${srcPath}/*.wxml`];
const lessFiles = [`${srcPath}/*.less`];
const jsFiles = [`${srcPath}/*.js`];
const jsonFiles = [`${srcPath}/*.json`];
const imgFiles = [
  `${srcPath}/images/*.{png,jpg,gif,ico}`,
  `${srcPath}/images/**/*.{png,jpg,gif,ico}`
];

async function js() {
  return src(jsFiles, { since: lastRun(js) })
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(dest(distPath))
}

async function wxss() {
  return src(lessFiles)
        .pipe(less())
        .pipe(rename({ extname: '.wxss' }))
        .pipe(dest(distPath))
}

async function wxml() {
  return src(wxmlFiles, { since: lastRun(wxml) })
        .pipe(dest(distPath))
}

async function json() {
  return src(jsonFiles, { since: lastRun(json) })
        .pipe(dest(distPath))
}

async function image() {
  return src(imgFiles, { since: lastRun(image)})
  .pipe(imagemin())
  .pipe(dest(distPath));
}

async function watchDev() {
  watch(lessFiles, wxss);
  watch(jsFiles, js);
  watch(imgFiles, image);
  watch(jsonFiles, json);
  watch(wxmlFiles, wxml);
}

function clean() {
  return del(['dist/**/*']);
}

exports.build = series(clean, parallel(wxml, js, json, wxss, image))
exports.dev = series(clean, parallel(wxml, js, json, wxss, image), watchDev)
// exports.dev = series(clean, wxss)