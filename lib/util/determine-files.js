"use strict";

let path = require("path");
let fs = require("fs");

// determines files within a directory, optionally filtered by a function
//
// if the returned function is called without any arguments, it will return a
// Promise with an array of all files that matched
// if it is called with an array of paths, it will return a Promise with an
// array of all provided paths that match
module.exports = function(source, filter = (_ => true)) {
	return files => {
		return determineFilesToProcess(source, files).
			then(skipDotfiles).
			then(fileNames => fileNames.filter(filter));
	};
};

function determineFilesToProcess(source, files) {
	return files ? filesWithinDirectory(source, files) : tree(source);
}

function skipDotfiles(files) {
	return files.filter(file => !file.startsWith("."));
}

function filesWithinDirectory(directory, files) {
	return new Promise(resolve => {
		resolve(files.
			map(file => path.relative(directory, file)).
			filter(file => !file.startsWith("..")));
	});
}

function tree(target, relativeTo = target) {
	return stat(target).then(results => {
		if(results.isDirectory()) {
			return readdir(target).then(entries => {
				return Promise.all(entries.map(entry => {
					return tree(path.join(target, entry), relativeTo);
				})).then(flatten);
			});
		} else {
			return [ path.relative(relativeTo, target) ];
		}
	});
}

function flatten(arr) {
	return [].concat.apply([], arr);
}

function stat(somePath) {
	return new Promise((resolve, reject) => {
		fs.stat(somePath, (err, r) => {
			if(err) {
				return reject(err);
			}
			resolve(r);
		});
	});
};

function readdir(somePath, opts) {
	return new Promise((resolve, reject) => {
		fs.readdir(somePath, opts, (err, r) => {
			if(err) {
				return reject(err);
			}
			resolve(r);
		});
	});
};
