"use strict";

let AssetManager = require("./manager");
let determineBrowserslist = require("./util/browserslist");
let { abort, repr } = require("./util");
let path = require("path");

let DEFAULTS = {
	plugins: { // maps config identifiers to corresponding import identifiers
		js: "faucet-pipeline-js",
		sass: "faucet-pipeline-sass",
		static: "faucet-pipeline-static"
	}
};

module.exports = (rootDir, config = "faucet.config.js", // eslint-disable-next-line indent
		{ watch, fingerprint, compact }) => {
	let configPath = path.resolve(rootDir, config);
	let configDir = path.dirname(configPath);
	config = require(configPath);

	let assetManager = new AssetManager(configDir, {
		manifestConfig: config.manifest,
		fingerprint,
		exitOnError: !watch
	});
	let watcher = watch && makeWatcher(config.watchDirs, configDir,
			assetManager.resolvePath);
	let browsers = determineBrowserslist(configDir);

	let plugins = Object.assign({}, DEFAULTS.plugins, config.plugins);
	Object.keys(plugins).forEach(type => {
		let pluginConfig = config[type];
		if(!pluginConfig) {
			return;
		}

		let plugin = load(plugins[type]);
		plugin(pluginConfig, assetManager, { watcher, browsers, compact });
	});
};

function makeWatcher(watchDirs, configDir, resolvePath) {
	let niteOwl = require("nite-owl");

	/* eslint-disable indent */
	watchDirs = watchDirs ?
			watchDirs.map(dir => resolvePath(dir, { enforceRelative: true })) :
			[configDir];
	/* eslint-enable indent */

	let watcher = niteOwl(watchDirs);
	watcher.on("error", err => {
		if(err.code === "ERR_TOO_MANY_FILES") {
			abort("There are too many files being monitored, please use the " +
					"`watchDirs` configuration setting:\n" +
					// eslint-disable-next-line max-len
					"https://github.com/faucet-pipeline/faucet-pipeline#configuration-for-file-watching");
		}

		throw err;
	});
	return watcher;
}

function load(pkg) {
	try {
		return require(pkg);
	} catch(err) {
		abort(`ERROR: missing plugin - please install ${repr(pkg)}`);
	}
}
