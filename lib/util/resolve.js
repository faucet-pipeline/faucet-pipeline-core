"use strict";

let { abort, repr } = require("./");
let path = require("path");

// older versions of Node do not support `require.resolve`'s `paths` option
let legacy = !require.resolve.paths;
if(!legacy) { // account for bug in Node v8.9.4 and below
	let { version } = process;
	if(version.substr(0, 3) === "v8.") {
		let [minor, patch] = version.substr(3).split(".").map(i => parseInt(i, 10));
		legacy = minor < 8 || patch <= 4;
	}
}

module.exports = function resolvePath(filepath, referenceDir, { enforceRelative } = {}) {
	if(filepath.substr(0, 2) === "./") {
		return path.resolve(referenceDir, filepath);
	} else if(enforceRelative) {
		abort(`ERROR: path must be relative: ${repr(filepath)}`);
	} else { // attempt via Node resolution algorithm
		try {
			return resolveModulePath(filepath, referenceDir);
		} catch(err) {
			abort(`ERROR: could not resolve ${repr(filepath)}`);
		}
	}
};

function resolveModulePath(filepath, rootDir) {
	if(legacy) {
		legacy = process.env.NODE_PATH; // cache previous value
		rootDir = rootDir.replace(/\/{1,}$/, ""); // strip trailing slashes, to be safe
		process.env.NODE_PATH = `${rootDir}:${rootDir}/node_modules`;
		require("module").Module._initPaths();
	}

	let res = require.resolve(filepath, { paths: [rootDir] });

	if(legacy) { // restore previous environment
		process.env.NODE_PATH = legacy;
		require("module").Module._initPaths();
	}

	return res;
}
