"use strict";

let path = require("path");
let crypto = require("crypto");

exports.abort = (msg, code = 1) => {
	console.error(msg);
	process.exit(code);
};

exports.generateFingerprint = (filepath, data) => {
	let filename = path.basename(filepath);
	let ext = filename.indexOf(".") === -1 ? "" : "." + filename.split(".").pop();
	let name = ext.length === 0 ? filename : path.basename(filepath, ext);
	let hash = generateHash(data);
	return path.join(path.dirname(filepath), `${name}-${hash}${ext}`);
};

// simplistic imitation of Node 8's `util.promisify`
// NB: only supports a single callback parameter
exports.promisify = fn => {
	return (...args) => new Promise((resolve, reject) => {
		fn(...args, (err, res) => {
			if(err) {
				reject(err);
				return;
			}
			resolve(res);
		});
	});
};

exports.repr = (value, jsonify = true) => {
	if(jsonify) {
		value = JSON.stringify(value);
	}
	return `\`${value}\``;
};

function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}
