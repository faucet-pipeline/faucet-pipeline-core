"use strict";

let { promisify } = require("../index");
let mkdirp = require("mkdirp");
let fs = require("fs");
let path = require("path");

let KNOWN = {}; // avoids redundant `mkdirp` invocations
let LOCKS = {};

let writeFile = promisify(fs.writeFile);

// avoids concurrent write operations and creates target directory if necessary
module.exports = function createFile(filepath, contents) {
	let lock = LOCKS[filepath];
	if(lock) { // defer
		return lock.then(_ => createFile(filepath, contents));
	}

	// create directory if necessary
	if(!KNOWN[filepath]) {
		KNOWN[filepath] = true;
		// NB: `sync` avoids race condition for subsequent operations
		mkdirp.sync(path.dirname(filepath));
	}

	let prom = writeFile(filepath, contents);
	LOCKS[filepath] = prom;
	return prom.then(_ => {
		delete LOCKS[filepath];
	});
};
