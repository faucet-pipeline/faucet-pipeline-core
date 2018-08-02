"use strict";

let path = require("path");
let createFile = require("./util/files");
let { abort } = require("./util");

module.exports = class Manifest {
	constructor(filepath, { key, value, baseURI, webRoot }, resolvePath) {
		this.filepath = filepath;
		this._index = {};
		this._queue = {};

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

	inProgress(originalPath) {
		this._queue[originalPath] = [];
	}

	get(originalPath) {
		return new Promise(resolve => {
			if(this._queue.hasOwnProperty(originalPath)) {
				this._queue[originalPath].push(_ => {
					resolve(this._index[originalPath]);
				});
			} else {
				resolve(this._index[originalPath]);
			}
		});
	}

	set(originalPath, actualPath, targetDir) {
		let key = this.keyTransform(originalPath, targetDir);
		let uri = this.valueTransform(actualPath);
		this._index[key] = uri;

		if(this._queue.hasOwnProperty(key)) {
			this._queue[key].forEach(resolve => { resolve(); });
			delete this._queue[key];
		}

		let fp = this.filepath;
		return fp ? createFile(fp, this.toJSON()) : Promise.resolve(null);
	}

	toJSON() {
		return JSON.stringify(this._index) + "\n";
	}
};
