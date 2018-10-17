"use strict";

let createFile = require("./util/files");
let resolvePath = require("./util/resolve");
let { abort } = require("./util");
let path = require("path");

module.exports = class Manifest {
	constructor(referenceDir, { target, key, value, baseURI, webRoot }) {
		if(target) {
			this.filepath = resolvePath(target, referenceDir, {
				enforceRelative: true
			});
		}
		this._index = {};

		if(key === "short") {
			this.keyTransform = (fp, targetDir) => path.relative(targetDir, fp);
		} else {
			this.keyTransform = key || (filepath => filepath);
		}

		if(value) {
			if(baseURI || webRoot) {
				abort("ERROR: `value` cannot be used with `baseURI` and/or `webRoot`");
			}
			this.valueTransform = value;
		} else {
			baseURI = baseURI || "/";
			webRoot = resolvePath(webRoot || "./", referenceDir,
					{ enforceRelative: true });
			this.valueTransform = filepath => baseURI + path.relative(webRoot, filepath);
		}
	}

	get(originalPath) {
		return this._index[originalPath];
	}

	set(originalPath, actualPath, targetDir) {
		let key = this.keyTransform(originalPath, targetDir);
		let uri = this.valueTransform(actualPath);
		this._index[key] = uri;

		let fp = this.filepath;
		return fp ? createFile(fp, this.toJSON()) : Promise.resolve(null);
	}

	toJSON() {
		return JSON.stringify(this._index) + "\n";
	}
};
