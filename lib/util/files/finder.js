let fs = require("fs");
let path = require("path");
let { promisify } = require("util");

let stat = promisify(fs.stat);
let readDir = promisify(fs.readdir);

module.exports = class FileFinder {
	constructor(directory, { skipDotfiles, filter = () => true } = {}) {
		this.directory = directory;
		this.filter = filename => {
			if(skipDotfiles && isDotfile(filename)) {
				return false;
			}
			return filter(filename);
		};
	}

	// returns a list of relative file paths within the respective directory
	all() {
		return tree(this.directory).
			then(filenames => filenames.filter(this.filter));
	}

	// returns all file paths that match the filter function
	match(filepaths) {
		return filesWithinDirectory(this.directory, filepaths).
			then(filepaths => filepaths.filter(this.filter));
	}
};

function tree(filepath, referenceDir = filepath) {
	return stat(filepath).
		then(res => {
			if(!res.isDirectory()) {
				return [path.relative(referenceDir, filepath)];
			}

			return readDir(filepath).
				then(entries => {
					let res = Promise.all(entries.map(entry => {
						return tree(path.join(filepath, entry), referenceDir);
					}));
					return res.then(flatten);
				});
		});
}

function filesWithinDirectory(directory, files) {
	return new Promise(resolve => {
		resolve(files.
			map(filepath => path.relative(directory, filepath)).
			filter(filename => !filename.startsWith("..")));
	});
}

function isDotfile(filename) {
	return path.basename(filename).startsWith(".");
}

function flatten(arr) {
	return [].concat.apply([], arr);
}
