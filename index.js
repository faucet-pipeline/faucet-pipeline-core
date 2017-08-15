"use strict";

let makeWatcher = require("nite-owl");
let path = require("path");

const PLUGINS = {
	js: "faucet-pipeline-js",
	sass: "faucet-pipeline-sass"
};

module.exports = (rootDir, config = "faucet.config.js", // eslint-disable-next-line indent
		{ watch, fingerprint = true, compact }) => {
	let configPath = path.resolve(rootDir, config);
	let configDir = path.dirname(configPath);
	config = require(configPath);

	let watcher;
	if(watch) {
		let { watchDirs } = config;
		/* eslint-disable indent */
		watchDirs = watchDirs ?
				watchDirs.map(dir => path.resolve(configDir, dir)) :
				[configDir];
		/* eslint-enable indent */

		let separator = watchDirs.length === 1 ? " " : "\n";
		console.error("monitoring file system at" + separator +
				watchDirs.join(separator));

		watcher = makeWatcher(watchDirs);
	}

	Object.keys(PLUGINS).forEach(type => {
		let cfg = config[type];
		if(!cfg) {
			return;
		}

		let plugin = load(PLUGINS[type]);
		plugin(cfg, configDir, { watcher, fingerprint, compact });
	});
};

function load(pkg) {
	try {
		return require(pkg);
	} catch(err) {
		console.error(err);
		console.error(`ERROR: missing plugin - please install ${pkg}`);
		process.exit(1);
	}
}
