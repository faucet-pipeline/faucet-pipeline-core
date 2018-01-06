"use strict";

let path = require("path");
let crypto = require("crypto");

exports.generateFingerprint = (filepath, contents) => {
	let ext = "." + filepath.split(".").pop(); // XXX: brittle; assumes regular file extension
	let name = path.basename(filepath, ext);
	let hash = generateHash(contents);
	return path.join(path.dirname(filepath), `${name}-${hash}${ext}`);
};

function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}
