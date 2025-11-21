"use strict";

let { createFile } = require("./util/files");
let { resolvePath } = require("./util/resolve");
let { abort } = require("./util");
let path = require("path");

exports.Manifest = class Manifest {
	constructor(referenceDir, { target, key, value, baseURI, webRoot } = {}) {
		if(value && (baseURI || webRoot)) {
			abort("ERROR: `value` must not be used with `baseURI` and/or `webRoot`");
		}
		this.webRoot = webRoot = resolvePath(webRoot || "./", referenceDir,
				{ enforceRelative: true });
		this.baseURI = baseURI || "/";

		if(target) {
			this.filepath = resolvePath(target, referenceDir, { enforceRelative: true });
		}
		this._index = new Map();

		if(key === "short") {
			this.keyTransform = (fp, targetDir) => path.relative(targetDir, fp);
		} else {
			this.keyTransform = key || (filepath => filepath);
		}

		if(value) {
			this.valueTransform = value;
		} else {
			this.valueTransform = filepath => this.baseURI + path.relative(webRoot, filepath);
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
		return fp ?
			createFile(fp, JSON.stringify(this.entries) + "\n") :
			Promise.resolve(null);
	}

	get entries() {
		return Object.fromEntries(this._index);
	}
};
