"use strict";

let makeWatcher = require("nite-owl");
let path = require("path");

const PLUGINS = {
	js: "faucet-pipeline-js",
	css: "faucet-pipeline-css"
};

module.exports = (rootDir, config = "faucet.js", // eslint-disable-next-line indent
		{ watch, fingerprint = true, compact }) => {
	let configPath = path.resolve(rootDir, config);
	let configDir = path.dirname(configPath);
	config = require(configPath);

	let watcher = watch && makeWatcher(rootDir, 100); // XXX: magic number; configurable?

	Object.keys(PLUGINS).forEach(type => {
		let cfg = config[type];
		if(!cfg) {
			return;
		}

		let plugin = load(PLUGINS[type]);
		plugin(cfg, { rootDir, configDir }, { watcher, fingerprint, compact });
	});
};

function load(pkg) {
	try {
		return require(pkg);
	} catch(err) {
		console.error(`ERROR: missing plugin - please install ${pkg}`);
		process.exit(1);
	}
}
