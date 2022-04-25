let { readdir, stat } = require("fs/promises");
let path = require("path");

exports.FileFinder = class FileFinder {
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
