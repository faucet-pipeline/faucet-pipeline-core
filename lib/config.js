"use strict";

let path = require("path");

module.exports = function readConfig(rootDir, filepath = "faucet.config.js") {
	let configPath = path.resolve(rootDir, filepath);
	return {
		referenceDir: path.dirname(configPath),
		config: require(configPath)
	};
};
