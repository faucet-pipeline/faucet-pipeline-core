let browserslist = require("browserslist");

module.exports = function determineBrowserslist(rootDir) {
	let browsers = browserslist.findConfig(rootDir);
	// limit Browserslist support to default group for now
	return browsers && browsers.defaults;
};
