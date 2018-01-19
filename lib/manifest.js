"use strict";

let createFile = require("./util/files");

let retryTimings = [10, 50, 100, 250, 500, 1000];

module.exports = class Manifest {
	constructor(filepath, { key, value }) {
		this.filepath = filepath;
		this.keyTransform = key || (f => f);
		this.valueTransform = value || (f => `/${f}`);
		this._index = {};

		this._lookup = this._lookup.bind(this);
	}

	lookup(targetPath) {
		return retry(this._lookup, retryTimings)(targetPath);
	}

	_lookup(targetPath) {
		return new Promise((resolve, reject) => {
			let outputPath = this.get(targetPath);
			if(outputPath) {
				resolve(outputPath);
			} else {
				reject(new Error(`could not find asset '${targetPath}'`));
			}
		});
	}

	get(originalPath) {
		return this._index[originalPath];
	}

	set(originalPath, actualPath, target) {
		let { keyTransform, valueTransform } = this;
		let uri = valueTransform(actualPath, target);
		this._index[keyTransform(originalPath, target)] = uri;

		let fp = this.filepath;
		return fp ? createFile(fp, this.toJSON()) : Promise.resolve(null);
	}

	toJSON() {
		return JSON.stringify(this._index) + "\n";
	}
};

// Retries a function that returns a promise
// The first argument is the function
// The second argument is an array of ms to wait in between attempts
// Returns a function that takes the same arguments as the provided function
function retry(fn, retries) {
	return (...params) => fn(...params).catch(err => {
		if(retries.length === 0) {
			throw err;
		}
		let backoff = retries.shift();
		return wait(backoff).then(_ => retry(fn, retries)(...params));
	});
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
