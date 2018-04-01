"use strict";

let fs = require("fs");
let path = require("path");

let stat = promisify(fs.stat);
let readdir = promisify(fs.readdir);

// determines files within a directory, optionally filtered by a function
//
// if the returned function is called without any arguments, it will return a
// Promise with an array of all files that matched
// if it is called with an array of paths, it will return a Promise with an
// array of all provided paths that match
module.exports = function findFiles(sourceDir, filter = (_ => true)) {
	return files => {
		return determineFilesToProcess(sourceDir, files).
			then(skipDotfiles).
			then(fileNames => fileNames.filter(filter));
	};
};

function determineFilesToProcess(directory, files) {
	return files ? filesWithinDirectory(directory, files) : tree(directory);
}

function skipDotfiles(files) {
	return files.filter(filename => !filename.startsWith("."));
}

function filesWithinDirectory(directory, files) {
	return new Promise(resolve => {
		resolve(files.
			map(filepath => path.relative(directory, filepath)).
			filter(filename => !filename.startsWith("..")));
	});
}

function tree(filepath, referenceDir = filepath) {
	return stat(filepath).
		then(res => {
			if(!res.isDirectory()) {
				return [ path.relative(referenceDir, filepath) ];
			}

			return readdir(filepath).
				then(entries => {
					let res = Promise.all(entries.map(entry => {
						return tree(path.join(filepath, entry), referenceDir);
					}));
					return res.then(flatten);
				});
		});
}

function promisify(fn) {
	return (...args) => {
		return new Promise((resolve, reject) => {
			fn(...args, (err, res) => {
				if(err) {
					reject(err);
					return;
				}
				resolve(res);
			});
		});
	};
}

function flatten(arr) {
	return [].concat.apply([], arr);
}
