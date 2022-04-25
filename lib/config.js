"use strict";

let path = require("path");

exports.readConfig = async function readConfig(rootDir, filepath = "faucet.config.js") {
	let configPath = path.resolve(rootDir, filepath);
	return {
		referenceDir: path.dirname(configPath),
		config: await require(configPath)
	};
};
