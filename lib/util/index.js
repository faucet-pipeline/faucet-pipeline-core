import path from "path";
import crypto from "crypto";

// reports success or failure for a given file path (typically regarding
// compilation or write operations)
export function reportFileStatus(filepath, referenceDir, error) {
	let ref = path.relative(referenceDir, filepath);
	console.error(error ? `✗ ${ref}: ${error.message || error}` : `✓ ${ref}`);
}

// attempts to load a module, prompting the user to install the corresponding
// package if it is unavailable
export async function loadExtension(pkg, errorMessage, supplier = pkg) {
	try {
		return await import(pkg);
	} catch(err) {
		if(err.code !== "ERR_MODULE_NOT_FOUND") {
			throw err;
		}
		abort(`${errorMessage} - please install ${repr(supplier)}`);
	}
}

export function generateFingerprint(filepath, data) {
	let filename = path.basename(filepath);
	let ext = filename.indexOf(".") === -1 ? "" : "." + filename.split(".").pop();
	let name = ext.length === 0 ? filename : path.basename(filepath, ext);
	let hash = generateHash(data);
	return path.join(path.dirname(filepath), `${name}-${hash}${ext}`);
}

export function abort(msg, code = 1) {
	console.error(msg);
	process.exit(code);
}

export function repr(value, jsonify = true) {
	if(jsonify) {
		value = JSON.stringify(value);
	}
	return `\`${value}\``;
}

function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}
