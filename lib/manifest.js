"use strict";

let path = require("path");
let createFile = require("./util/files");
let { abort } = require("./util");

module.exports = class Manifest {
	constructor({ target, key, value, baseURI, webRoot }, resolvePath) {
		if(target) {
			this.filepath = resolvePath(target, {
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
			webRoot = resolvePath(webRoot || "./", { enforceRelative: true });
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
