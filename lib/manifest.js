"use strict";

module.exports = class Manifest {
	constructor() {
		this._index = {};
	}

	get(originalPath) {
		return this._index[originalPath];
	}

	set(originalPath, uri) {
		this._index[originalPath] = uri;
	}

	toJSON() {
		return JSON.stringify(this._index);
	}
};
