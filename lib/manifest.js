"use strict";

let createFile = require("./util/files");
let resolvePath = require("./util/resolve");
let { abort } = require("./util");
let path = require("path");

module.exports = class Manifest {
	constructor(referenceDir, { target, key, value, baseURI, webRoot } = {}) {
		if(target) {
			this.filepath = resolvePath(target, referenceDir, {
				enforceRelative: true
			});
		}
		this._index = new Map();

		if(key === "short") {
			this.keyTransform = (fp, targetDir) => path.relative(targetDir, fp);
		} else {
			this.keyTransform = key || (filepath => filepath);
		}

		this.webRoot = resolvePath(webRoot || "./", referenceDir,
				{ enforceRelative: true });

		if(value) {
			if(baseURI || webRoot) {
				abort("ERROR: `value` cannot be used with `baseURI` and/or `webRoot`");
			}
			this.valueTransform = value;
		} else {
			baseURI = baseURI || "/";
			this.valueTransform = filepath => baseURI + path.relative(this.webRoot, filepath);
		}
	}

	get(originalPath) {
		return this._index.get(originalPath);
	}

	set(originalPath, actualPath, targetDir) {
		let key = this.keyTransform(originalPath, targetDir);
		let uri = this.valueTransform(actualPath);
		this._index.set(key, uri);

		let fp = this.filepath;
		return fp ? createFile(fp, JSON.stringify(this) + "\n") : Promise.resolve(null);
	}

	toJSON() {
		let index = this._index;
		return Array.from(index.keys()).sort().reduce((memo, key) => {
			memo[key] = index.get(key);
			return memo;
		}, {});
	}
};
