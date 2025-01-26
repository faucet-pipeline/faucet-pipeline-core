import { writeFile } from "fs/promises";
import { mkdirSync } from "fs";
import path from "path";

let KNOWN = new Set(); // avoids redundant `mkdir` invocations
let LOCKS = new Map();

// avoids concurrent write operations and creates target directory if necessary
export function createFile(filepath, contents) {
	let lock = LOCKS.get(filepath);
	if(lock) { // defer
		return lock.then(() => createFile(filepath, contents));
	}

	// create directory if necessary
	if(!KNOWN.has(filepath)) {
		KNOWN.add(filepath);
		// NB: `sync` avoids race condition for subsequent operations
		mkdirSync(path.dirname(filepath), { recursive: true });
	}

	let prom = writeFile(filepath, contents);
	LOCKS.set(filepath, prom);
	return prom.then(() => {
		LOCKS.delete(filepath);
	});
}
