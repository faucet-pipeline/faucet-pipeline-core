"use strict";

let path = require("path");
let crypto = require("crypto");

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

exports.generateFingerprint = (filepath, data) => {
	let filename = path.basename(filepath);
	let ext = filename.indexOf(".") === -1 ? "" : "." + filename.split(".").pop();
	let name = ext.length === 0 ? filename : path.basename(filepath, ext);
	let hash = generateHash(data);
	return path.join(path.dirname(filepath), `${name}-${hash}${ext}`);
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

function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}
