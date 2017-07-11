"use strict";

let path = require("path");
let crypto = require("crypto");

exports.generateFingerprint = (filename, contents) => {
	let ext = "." + filename.split(".").pop(); // XXX: brittle; assumes regular file extension
	let name = path.basename(filename, ext);
	let hash = generateHash(contents);
	return `${name}-${hash}${ext}`;
};

function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}
