const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');

function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src('app/fonts/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts/'))
}

function sprite() {
    return src('app/images/dist/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('app/images/dist'))
}

function images() {
    return src(['app/images/src/*.*', '!app/images/src/*.svg'])
        .pipe(newer('app/images/dist'))
        .pipe(avif({
            quality: 50
        }))

        .pipe(src(['app/images/src/*.*']))
        .pipe(newer('app/images/dist'))
        .pipe(webp())

        .pipe(src(['app/images/src/*.*']))
        .pipe(newer('app/images/dist'))
        .pipe(imagemin())

        .pipe(dest('app/images/dist'))
}

function styles() {
    return src('app/scss/style.scss')
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version']
        }))
        .pipe(concat('style.min.css'))
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function scripts() {
    return src([
            'app/js/*.js',
            '!app/js/main.min.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
    watch(['app/scss/style.scss'], styles)
    watch(['app/images/src'], images)
    watch(['app/js/*.js', '!app/js/main.min.js'], scripts)
    watch(['app/**/*.html']).on('change', browserSync.reload)
}


function cleanDist() {
    return src('dist')
        .pipe(clean())
}

function building() {
    return src([
            'app/css/style.min.css',
            'app/images/dist/*.*',
            '!app/images/dist/*.svg',
            'app/images/dist/sprite.svg',
            'app/fonts/*.*',
            'app/js/main.min.js',
            'app/**/*html'
        ], {
            base: 'app' //save basic structure
        })
        .pipe(dest('dist'))
}
exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.images = images;
exports.sprite = sprite;
exports.fonts = fonts;
exports.building = building;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, images, watching);