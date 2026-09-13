"use strict";

let path = require("node:path");

exports.abort = abort;
exports.repr = repr;

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

function repr(value, jsonify = true) {
	if(jsonify) {
		value = JSON.stringify(value);
	}
	return `\`${value}\``;
}
