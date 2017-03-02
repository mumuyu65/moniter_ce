var gulp = require('gulp'),
minifycss = require('gulp-minify-css'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
rename = require('gulp-rename');
//语法检查
// gulp.task('jshint', function () {
//     return gulp.src('dist/*.js')
//         .pipe(jshint())
//         .pipe(jshint.reporter('default'));
// });
//压缩css
// gulp.task('minifycss', function() {
//     return gulp.src('dist/*.css')    //需要操作的文件
//         .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
//         .pipe(minifycss())   //执行压缩
//         .pipe(gulp.dest('Css'));   //输出文件夹
// });

//压缩，合并 js
gulp.task('minifyjs', function() {
    return gulp.src('dist/*.js')      //需要操作的文件
        // .pipe(concat('main.js'))    //合并所有js到main.js
        // .pipe(gulp.dest('dist'))       //输出到文件夹
        // .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(
            uglify({
                mangle: true,//类型：Boolean 默认：true 是否修改变量名
                compress: true,//类型：Boolean 默认：true 是否完全压缩
                preserveComments: 'license' //保留所有注释
            })
        )
        .pipe(gulp.dest('dist'));
});
//默认命令，在cmd中输入gulp后，执行的就是这个任务(压缩js需要在检查js之后操作)
gulp.task('default',['minifyjs']);
