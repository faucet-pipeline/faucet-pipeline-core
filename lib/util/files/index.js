"use strict";

let { abort, repr } = require("../");
let fs = require("fs");
let path = require("path");
let { promisify } = require("util");

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
		mkdirpSync(path.dirname(filepath));
	}

	let prom = writeFile(filepath, contents);
	LOCKS[filepath] = prom;
	return prom.then(_ => {
		delete LOCKS[filepath];
	});
};

function mkdirpSync(directory) {
	try {
		// NB: `recursive` option was introduced in Node v10.12.0
		fs.mkdirSync(directory, { recursive: true });
	} catch(err) {
		abort(`ERROR: auto-creating ${repr(directory)} requires ` +
				"Node v10.12.0 or above");
	}
}
