"use strict";

let path = require("path");
let Manifest = require("./lib/manifest");
let browserslist = require("browserslist");

const PLUGINS = {
	js: "faucet-pipeline-js",
	sass: "faucet-pipeline-sass",
	static: "faucet-pipeline-static"
};

module.exports = (rootDir, config = "faucet.config.js", // eslint-disable-next-line indent
		{ watch, fingerprint = true, compact }) => {
	let configPath = path.resolve(rootDir, config);
	let configDir = path.dirname(configPath);
	config = require(configPath);

	let watcher;
	if(watch) {
		watcher = makeWatcher(config.watchDirs, configDir);
	}
	let manifest = new Manifest(config.manifest, fingerprint, {
		configDir: configDir,
		exitOnError: !watch
	});
	let browsers = browserslist.findConfig(configDir);

	Object.keys(PLUGINS).forEach(type => {
		let cfg = config[type];
		if(!cfg) {
			return;
		}

		let plugin = load(PLUGINS[type]);
		plugin(cfg, configDir, { watcher, compact, manifest, browsers });
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

function makeWatcher(watchDirs, configDir) {
	let niteOwl = require("nite-owl");

	/* eslint-disable indent */
	watchDirs = watchDirs ?
			watchDirs.map(dir => path.resolve(configDir, dir)) :
			[configDir];
	/* eslint-enable indent */

	let separator = watchDirs.length === 1 ? " " : "\n";
	console.error("monitoring file system at" + separator + watchDirs.join(separator));

	let watcher = niteOwl(watchDirs);
	watcher.on("error", err => {
		if(err.code === "ERR_TOO_MANY_FILES") {
			console.error("There are too many files being monitored, " +
					"please use the `watchDirs` configuration setting:\n" +
					// eslint-disable-next-line max-len
					"https://github.com/faucet-pipeline/faucet-pipeline#configuration-for-file-watching");
			process.exit(1);
		}

		throw err;
	});
	return watcher;
}
