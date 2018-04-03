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

exports.repr = value => `\`${JSON.stringify(value)}\``;

function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}

// very simple, 90% solution to promisify functions
exports.promisify = fn => {
	return (...args) => {
		return new Promise((resolve, reject) => {
			fn(...args, (err, res) => {
				if(err) {
					reject(err);
					return;
				}
				resolve(res);
			});
		});
	};
};
