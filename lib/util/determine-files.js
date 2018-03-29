let path = require("path");
let fs = require("fs");

/* Returns a function that determines files to process
 *
 * This is useful for pipelines that process a directory of files.
 * It takes a source directory and optionally a predicate that is used to filter
 * the determined files. It automatically filters invisible files.
 *
 * If the returned function is called without any arguments, it will return a
 * Promise with an array of all files that matched.
 * If it is called with an array of paths, it will return a Promise with an
 * array of all of those files that matched.
 */
module.exports = function(source, predicate = (_ => true)) {
	return files => {
		return determineFilesToProcess(source, files).
			then(skipInvisibleFiles).
			then(fileNames => fileNames.filter(predicate));
	};
};

function determineFilesToProcess(source, files) {
	if(files) {
		return filesWithinDirectory(source, files);
	} else {
		return tree(source);
	}
}

function skipInvisibleFiles(files) {
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
