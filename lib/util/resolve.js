"use strict";

let { abort, repr } = require("./");
let path = require("path");
let fs = require("fs");

module.exports = function resolvePath(filepath, referenceDir, { enforceRelative } = {}) {
	if(/^\.?\.\//.test(filepath)) { // starts with `./` or `../`
		return path.resolve(referenceDir, filepath);
	} else if(enforceRelative) {
		abort(`ERROR: path must be relative: ${repr(filepath)}`);
	} else { // attempt via Node resolution algorithm
		try {
			return require.resolve(filepath, { paths: [referenceDir] });
		// attempt to resolve non-JavaScript package references via a simplistic heuristic
		} catch(err) {
			let resolved = path.resolve(referenceDir, "node_modules", filepath);
			try {
				fs.statSync(resolved); // ensures file/directory exists
			} catch(_err) {
				abort(`ERROR: could not resolve ${repr(filepath)}`);
			}
			return resolved;
		}
	}
};
