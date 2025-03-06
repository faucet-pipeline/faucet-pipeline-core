let { readdir, stat } = require("node:fs/promises");
let path = require("node:path");

exports.FileFinder = class FileFinder {
	constructor(directory, { skipDotfiles, filter } = {}) {
		this.directory = directory;
		this.filter = filename => {
			if(skipDotfiles && path.basename(filename).startsWith(".")) {
				return false;
			}
			return filter === undefined ? true : filter(filename);
		};
	}

	// returns a list of relative file paths within the respective directory
	async all() {
		let filenames = await tree(this.directory);
		return filenames.filter(this.filter);
	}

	// returns all file paths that match the filter function
	async match(filepaths) {
		return filepaths.map(filepath => path.relative(this.directory, filepath)).
			filter(filename => !filename.startsWith("..")).
			filter(this.filter);
	}
};

async function tree(filepath, referenceDir = filepath) {
	let res = await stat(filepath);
	if(!res.isDirectory()) {
		return [path.relative(referenceDir, filepath)];
	}

	let entries = await readdir(filepath);
	entries = await Promise.all(entries.map(entry => {
		return tree(path.join(filepath, entry), referenceDir);
	}));
	return entries.flat();
}
