"use strict";

let { Manifest } = require("./manifest");
let { createFile } = require("./util/files");
let { resolvePath } = require("./util/resolve");
let { reportFileStatus, abort } = require("./util");
let path = require("node:path");
let crypto = require("node:crypto");

exports._generateFingerprint = generateFingerprint; // for testing purposes only

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
	let ext = path.extname(filename);
	let name = ext.length === 0 ? filename : path.basename(filepath, ext);

	let hash = crypto.createHash("sha256");
	hash.update(data);

	return path.join(path.dirname(filepath), `${name}-${hash.digest("hex")}${ext}`);
}
