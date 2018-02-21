let browserslist = require("browserslist");

exports.determineBrowserslist = function determineBrowserslist(rootDir) {
	let browsers = browserslist.findConfig(rootDir);
	// limit Browserslist support to default group for now
	return browsers && browsers.defaults;
};

exports.reportBrowsers = function reportBrowsers(prefix, browsers) {
	if(browsers && browsers.length) {
		console.error(prefix, browsers.join(", "));
	}
};
