"use strict";

let createFile = require("./util/files");
let path = require("path");

module.exports = class Manifest {
	constructor(filepath, baseURI) {
		this.filepath = filepath;
		this.baseURI = baseURI;
		this._index = {};
	}

	get(originalPath) {
		return this._index[originalPath];
	}

	set(originalPath, actualPath) {
		let { baseURI } = this;
		/* eslint-disable indent */
		let uri = baseURI.call ?
				baseURI(actualPath, path.basename(actualPath)) :
				uriJoin(baseURI, actualPath);
		/* eslint-enable indent */
		this._index[originalPath] = uri;

		let fp = this.filepath;
		return fp ? createFile(fp, this.toJSON()) : Promise.resolve(null);
	}

	toJSON() {
		return JSON.stringify(this._index) + "\n";
	}
};

function uriJoin(...segments) {
	let last = segments.pop();
	segments.map(segment => segment.replace(/\/$/, "")); // strip trailing slash
	return segments.concat(last).join("/");
}
