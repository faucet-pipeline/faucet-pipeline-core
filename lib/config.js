"use strict";

let path = require("path");

module.exports = function readConfig(rootDir, filepath = "faucet.config.js") {
	let configPath = path.resolve(rootDir, filepath);
	let config = require(configPath);
	config._root = path.dirname(configPath);
	return config;
};
