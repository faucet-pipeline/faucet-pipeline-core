"use strict";

let retryTimings = [10, 50, 100, 250, 500, 1000];

module.exports = class Manifest {
	constructor() {
		this._index = {};

		this._lookup = this._lookup.bind(this);
	}

	lookup(targetPath) {
		return retry(this._lookup, retryTimings)(targetPath);
	}

	_lookup(targetPath) {
		return new Promise((resolve, reject) => {
			let outputPath = this.manifest[targetPath];
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

	set(originalPath, uri) {
		this._index[originalPath] = uri;
	}

	toJSON() {
		return JSON.stringify(this._index);
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
