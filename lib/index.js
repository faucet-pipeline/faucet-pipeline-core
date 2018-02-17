"use strict";

let AssetManager = require("./manager");
let { repr } = require("./util");
let browserslist = require("browserslist");
let fs = require("fs");
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
	config = loadConfig(configPath);

	let assetManager = new AssetManager(configDir, {
		manifestConfig: config.manifest,
		fingerprint,
		exitOnError: !watch
	});
	let watcher = watch && makeWatcher(config.watchDirs, configDir,
			assetManager.resolvePath);
	let browsers = browserslist.findConfig(configDir);

	let plugins = Object.assign({}, DEFAULTS.plugins, config.plugins);
	Object.keys(plugins).forEach(type => {
		let pluginConfig = config[type];
		if(!pluginConfig) {
			return;
		}

		let plugin = load(plugins[type], "plugin");
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

function loadConfig(filepath) {
	try {
		return require(filepath);
	} catch(err) {
		let yaml = load("js-yaml");
		// XXX: changing extension automatically is hacky!?
		let loadYAML = (filepath, extension) => {
			filepath = filepath.replace(/\.js$/, extension);
			let data = fs.readFileSync(filepath, "utf8");
			return yaml.safeLoad(data);
		};
		try {
			return loadYAML(filepath, ".yaml");
		} catch(err) {
			return loadYAML(filepath, ".yml");
		}
	}
}

function load(pkg, type = "package") {
	try {
		return require(pkg);
	} catch(err) {
		abort(`ERROR: missing ${type} - please install ${repr(pkg)}`);
	}
}

function abort(msg) {
	console.error(msg);
	process.exit(1);
}
