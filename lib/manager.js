"use strict";

let Manifest = require("./manifest");
let createFile = require("./util/files");
let { generateFingerprint } = require("./util");
let path = require("path");

module.exports = class AssetManager {
	constructor(referenceDir, { manifestConfig, fingerprint, exitOnError } = {}) {
		this.referenceDir = referenceDir;
		this.fingerprint = fingerprint;
		this.exitOnError = exitOnError;
		let manifest = this.resolvePath(manifestConfig.file, { enforceRelative: true });
		this.manifest = new Manifest(manifest, manifestConfig.baseURI);

		// bind methods for convenience
		this.writeFile = this.writeFile.bind(this);
		this.resolvePath = this.resolvePath.bind(this);
	}

	writeFile(filepath, data, { error } = {}) {
		let originalPath = filepath;
		if(this.fingerprint) {
			filepath = generateFingerprint(filepath, data);
		}

		return createFile(filepath, data).
			then(_ => this._updateManifest(originalPath, filepath)).
			then(_ => {
				this._report(originalPath, error);
				if(error && this.exitOnError) {
					throw error;
				}
			}).
			catch(err => { // eslint-disable-line handle-callback-err
				console.error("aborting");
				process.exit(1);
			});
	}

	resolvePath(filepath, { enforceRelative } = {}) {
		if(filepath.substr(0, 2) === "./") {
			return path.resolve(this.referenceDir, filepath);
		} else if(enforceRelative) {
			throw new Error(`path must be relative: \`${repr(filepath)}\``);
		} else { // attempt via Node resolution algorithm
			try {
				return resolveModulePath(filepath, this.referenceDir);
			} catch(err) {
				throw new Error(`could not resolve \`${repr(filepath)}\``);
			}
		}
	}

	_updateManifest(originalPath, actualPath) {
		let { manifest, referenceDir } = this;
		originalPath = path.relative(referenceDir, originalPath);
		actualPath = path.relative(referenceDir, actualPath);
		return manifest.set(originalPath, actualPath);
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

function resolveModulePath(filepath, rootDir) {
	// older versions of Node do not support `require.resolve`'s `paths` option
	let legacy = !require.resolve.paths;
	if(legacy) {
		legacy = process.env.NODE_PATH; // cache previous value
		rootDir = rootDir.replace(/\/{1,}$/, ""); // strip trailing slashes, to be safe
		process.env.NODE_PATH = rootDir + "/node_modules";
		require("module").Module._initPaths();
	}

	let res = require.resolve(filepath, { paths: [rootDir] });

	if(legacy) { // restore previous environment
		process.env.NODE_PATH = legacy;
		require("module").Module._initPaths();
	}

	return res;
}

function repr(value) {
	return `\`${JSON.stringify(value)}\``;
}
