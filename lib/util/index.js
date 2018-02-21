"use strict";

let path = require("path");
let crypto = require("crypto");

exports.abort = msg => {
	console.error(msg);
	process.exit(1);
};

exports.generateFingerprint = (filepath, data) => {
	let ext = "." + filepath.split(".").pop(); // XXX: brittle; assumes regular file extension
	let name = path.basename(filepath, ext);
	let hash = generateHash(data);
	return path.join(path.dirname(filepath), `${name}-${hash}${ext}`);
};

exports.repr = value => `\`${JSON.stringify(value)}\``;

function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}
