"use strict";

let Manifest = require("./manifest");
let resolveModulePath = require("./util/resolve");
let createFile = require("./util/files");
let { abort, generateFingerprint, repr } = require("./util");
let path = require("path");

module.exports = class AssetManager {
	constructor(referenceDir, { manifestConfig, fingerprint, exitOnError } = {}) {
		this.referenceDir = referenceDir;
		this.fingerprint = fingerprint;
		this.exitOnError = exitOnError;

		// bind methods for convenience
		this.writeFile = this.writeFile.bind(this);
		this.resolvePath = this.resolvePath.bind(this);

		if(manifestConfig) {
			let { resolvePath } = this;
			let manifestPath = resolvePath(manifestConfig.file, {
				enforceRelative: true
			});
			this.manifest = new Manifest(manifestPath, manifestConfig, resolvePath);
		}
	}

	writeFile(filepath, data, { targetDir, error } = {}) {
		if(!targetDir) {
			targetDir = path.dirname(filepath);
		}

		let originalPath = filepath;
		if(this.fingerprint) {
			filepath = generateFingerprint(filepath, data);
		}

		return createFile(filepath, data).
			then(_ => this.manifest &&
					this._updateManifest(originalPath, filepath, targetDir)).
			then(_ => {
				this._report(originalPath, error);
				if(error && this.exitOnError) {
					throw error;
				}
			}).
			catch(err => { // eslint-disable-line handle-callback-err
				abort(`aborting: ${err}`);
			});
	}

	resolvePath(filepath, { enforceRelative } = {}) {
		if(filepath.substr(0, 2) === "./") {
			return path.resolve(this.referenceDir, filepath);
		} else if(enforceRelative) {
			throw new Error(`path must be relative: ${repr(filepath)}`);
		} else { // attempt via Node resolution algorithm
			try {
				return resolveModulePath(filepath, this.referenceDir);
			} catch(err) {
				throw new Error(`could not resolve ${repr(filepath)}`);
			}
		}
	}

	get packagesDir() {
		let memo = this._packagesDir;
		if(!memo) {
			memo = this._packagesDir = this.resolvePath("./node_modules");
		}
		return memo;
	}

	_updateManifest(originalPath, actualPath, targetDir) {
		let { referenceDir } = this;
		originalPath = path.relative(referenceDir, originalPath);
		actualPath = path.relative(referenceDir, actualPath);
		return this.manifest.set(originalPath, actualPath, targetDir);
	}

	_report(filepath, error) {
		let relPath = path.relative(this.referenceDir, filepath);
		if(error) {
			console.error(`✗ ${relPath}: ${error.message || error}`);
		} else {
			console.error(`✓ ${relPath}`);
		}
	}
};
