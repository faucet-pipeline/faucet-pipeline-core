"use strict";

let { abort, repr } = require("./");
let path = require("path");

module.exports = function resolvePath(filepath, referenceDir, { enforceRelative } = {}) {
	if(/^\.?\.\//.test(filepath)) { // starts with `./` or `../`
		return path.resolve(referenceDir, filepath);
	} else if(enforceRelative) {
		abort(`ERROR: path must be relative: ${repr(filepath)}`);
	} else { // attempt via Node resolution algorithm
		try {
			return require.resolve(filepath, { paths: [referenceDir] });
		} catch(err) {
			abort(`ERROR: could not resolve ${repr(filepath)}`);
		}
	}
};
