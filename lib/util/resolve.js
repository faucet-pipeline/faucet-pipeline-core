"use strict";

let { abort, repr } = require("./");
let fs = require("fs");
let path = require("path");

exports.resolvePath = function resolvePath(filepath, referenceDir,
		{ enforceRelative } = {}) {
	if(/^\.?\.\//.test(filepath)) { // starts with `./` or `../`
		return path.resolve(referenceDir, filepath);
	} else if(enforceRelative) {
		abort(`ERROR: path must be relative: ${repr(filepath)}`);
	} else { // attempt via Node resolution algorithm
		try {
			return require.resolve(filepath, { paths: [referenceDir] });
		} catch(err) {
			// attempt to resolve non-JavaScript package references by relying
			// on typical package paths (simplistic approximation of Node's
			// resolution algorithm)
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
