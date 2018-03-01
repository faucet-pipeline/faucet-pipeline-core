let path = require("path");

exports.manifest = (manifestPath, webRoot = ".", baseURL = "/") => {
	return {
		file: manifestPath,
		value: f => `${baseURL}${path.relative(webRoot, f)}`
	};
};

exports.briefManifest = (manifestPath, webRoot = ".", baseURL = "/") => {
	return {
		file: manifestPath,
		key: (f, targetDir) => path.relative(targetDir, f),
		value: f => `${baseURL}${path.relative(webRoot, f)}`
	};
};
