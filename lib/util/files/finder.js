let fs = require("fs");
let path = require("path");
let { promisify } = require("..");

let stat = promisify(fs.stat);
let readdir = promisify(fs.readdir);

module.exports = class FileFinder {
	constructor(dir, { skipDotfiles = false, filter = (_ => true) } = {}) {
		this.dir = dir;
		this.filter = filename => {
			if(skipDotfiles && isDotfile(filename)) {
				return false;
			} else {
				return filter(filename);
			}
		};
	}

	// returns all paths that are found
	all() {
		return tree(this.dir).
			then(filenames => filenames.filter(this.filter));
	}

	// returns all paths that match
	match(paths) {
		return filesWithinDirectory(this.dir, paths).
			then(filenames => filenames.filter(this.filter));
	}
};

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
