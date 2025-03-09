"use strict";

let { Manifest } = require("./manifest");
let { createFile } = require("./util/files");
let { reportFileStatus, abort, resolvePath } = require("./util");
let path = require("path");
let crypto = require("crypto");

exports.AssetManager = class AssetManager {
	constructor(referenceDir, { manifestConfig, fingerprint, exitOnError } = {}) {
		this.referenceDir = referenceDir;
		this.fingerprint = fingerprint;
		this.exitOnError = exitOnError;

		this.writeFile = this.writeFile.bind(this); // for convenience
		this.resolvePath = filepath => resolvePath(filepath, referenceDir);

		this.manifest = new Manifest(referenceDir, manifestConfig || {});
	}

	// NB: `fingerprint` option takes precedence over corresponding instance property
	writeFile(filepath, data, { targetDir, fingerprint = this.fingerprint, error } = {}) {
		if(!targetDir) {
			targetDir = path.dirname(filepath);
		}

		let originalPath = filepath;
		if(fingerprint) {
			filepath = generateFingerprint(filepath, data);
		}

		return createFile(filepath, data).
			then(() => this.manifest &&
					this._updateManifest(originalPath, filepath, targetDir)).
			then(() => {
				reportFileStatus(originalPath, this.referenceDir, error);
				if(error && this.exitOnError) {
					throw error;
				}
			}).
			catch(err => { // eslint-disable-line handle-callback-err
				abort(`aborting: ${err}`);
			});
	}

	_updateManifest(originalPath, actualPath, targetDir) {
		let { referenceDir } = this;
		originalPath = path.relative(referenceDir, originalPath);
		actualPath = path.relative(referenceDir, actualPath);
		return this.manifest.set(originalPath, actualPath, targetDir);
	}
};

function generateFingerprint(filepath, data) {
	let filename = path.basename(filepath);
	let ext = filename.indexOf(".") === -1 ? "" : "." + filename.split(".").pop();
	let name = ext.length === 0 ? filename : path.basename(filepath, ext);
	let hash = generateHash(data);
	return path.join(path.dirname(filepath), `${name}-${hash}${ext}`);
}

// exported for testing
exports.generateFingerprint = generateFingerprint;

function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}
