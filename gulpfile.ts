const gulp = require('gulp');

function copyIcons() {
	// Copy icons to dist/icons (standard location)
	gulp.src('icons/**/*').pipe(gulp.dest('dist/icons'));
	// Copy icons to dist/nodes/ZaloBot (where n8n looks for file:zalo.svg relative to node file)
	return gulp.src('icons/**/*').pipe(gulp.dest('dist/nodes/ZaloBot'));
}

module.exports = {
	build: copyIcons,
	buildIcons: copyIcons,
};

export const build = copyIcons;
export const buildIcons = copyIcons;


