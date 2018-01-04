"use strict";

let createFile = require("./util/files");
let { repr } = require("./util");
let path = require("path");

let retryTimings = [10, 50, 100, 250, 500, 1000];

module.exports = class Manifest {
	constructor(filepath, baseURI) {
		this.filepath = filepath;
		this.baseURI = baseURI;
		this._index = {};

		this._resolve = this._resolve.bind(this);
	}

	// repeatedly attempts `#get` until it resolves successfully or times out
	resolve(originalPath) {
		return retry(this._resolve, retryTimings)(originalPath);
	}

	_resolve(originalPath) {
		return new Promise((resolve, reject) => {
			let actualPath = this.get(originalPath);
			if(actualPath) {
				resolve(actualPath);
			} else {
				reject(new Error(`could not find asset ${repr(originalPath)}`));
			}
		});
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

// repeatedly invokes a function which returns a promise until it is resolved or
// all `retries` are exhausted
// `retries` is an array of milliseconds to wait in between attempts
// returns a new function that wraps `fn`, accepting the same arguments
function retry(fn, retries) {
	return (...params) => fn(...params).
		catch(err => {
			if(retries.length === 0) {
				throw err;
			}

			let backoff = retries.shift();
			return wait(backoff).
				then(_ => retry(fn, retries)(...params));
		});
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
