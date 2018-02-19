"use strict";

let AssetManager = require("./manager");
let determineBrowserslist = require("./util/browserslist");
let { abort, repr } = require("./util");
let fs = require("fs");
let path = require("path");

let DEFAULTS = {
	plugins: { // maps config identifiers to corresponding import identifiers
		js: "faucet-pipeline-js",
		sass: "faucet-pipeline-sass",
		static: "faucet-pipeline-static"
	}
};

module.exports = (rootDir, configPath, { watch, fingerprint, compact }) => {
	let { config, configDir } = determineConfig(rootDir, configPath);
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

function determineConfig(rootDir, filepath) {
	if(!filepath) {
		let candidates = new Set(fs.readdirSync(rootDir));
		["js", "json", "yaml", "yml"].some(ext => {
			let filename = `faucet.config.${ext}`;
			if(candidates.has(filename)) {
				filepath = path.resolve(rootDir, filename);
				return true;
			}
		});
	}

	let ext = filepath.split(".").pop();
	let config = {
		js: require,
		json: require,
		yaml: loadYAML,
		yml: loadYAML
	}[ext](filepath);
	let configDir = path.dirname(filepath);
	return { config, configDir };
}

function loadYAML(filepath) {
	let yaml = load("js-yaml");
	let data = fs.readFileSync(filepath, "utf8");
	return yaml.safeLoad(data);
}

function load(pkg, type = "package") {
	try {
		return require(pkg);
	} catch(err) {
		abort(`ERROR: missing ${type} - please install ${repr(pkg)}`);
	}
}
