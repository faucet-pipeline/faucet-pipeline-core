"use strict";

let fs = require("fs");
let path = require("path");

// reports success or failure for a given file path (typically regarding
// compilation or write operations)
exports.reportFileStatus = (filepath, referenceDir, error) => {
	let ref = path.relative(referenceDir, filepath);
	console.error(error ? `✗ ${ref}: ${error.message || error}` : `✓ ${ref}`);
};

// attempts to load a module, prompting the user to install the corresponding
// package if it is unavailable
exports.loadExtension = async (pkg, errorMessage, supplier = pkg) => {
	try {
		return await require(pkg);
	} catch(err) {
		if(err.code !== "MODULE_NOT_FOUND") {
			throw err;
		}
		abort(`${errorMessage} - please install ${repr(supplier)}`);
	}
};

function abort(msg, code = 1) {
	console.error(msg);
	process.exit(code);
}
exports.abort = abort;

function repr(value, jsonify = true) {
	if(jsonify) {
		value = JSON.stringify(value);
	}
	return `\`${value}\``;
}
exports.repr = repr;

exports.resolvePath = (filepath, referenceDir, { enforceRelative } = {}) => {
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
