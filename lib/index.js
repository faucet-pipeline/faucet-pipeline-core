"use strict";

let AssetManager = require("./manager");
let { abort, repr } = require("./util");
let browserslist = require("browserslist");
let SerializedRunner = require("./util/runner");

let DEFAULTS = {
	// maps config identifiers to corresponding import identifiers and buckets
	plugins: {
		js: {
			plugin: "faucet-pipeline-js",
			bucket: "scripts"
		},
		sass: {
			plugin: "faucet-pipeline-sass",
			bucket: "styles"
		},
		static: {
			plugin: "faucet-pipeline-static",
			bucket: "static"
		}
	}
};

module.exports = (referenceDir, config, { watch, fingerprint, sourcemaps, compact }) => {
	let assetManager = new AssetManager(referenceDir, {
		manifestConfig: config.manifest,
		fingerprint,
		exitOnError: !watch
	});
	let browsers = browserslist.findConfig(referenceDir) || {};

	let plugins = Object.assign({}, DEFAULTS.plugins, config.plugins);
	let buckets = {
		static: [],
		scripts: [],
		styles: [],
		markup: []
	};
	Object.keys(plugins).forEach(type => {
		let pluginConfig = config[type];
		if(!pluginConfig) {
			return;
		}

		let { bucket, plugin } = plugins[type];
		if(!plugin.call) {
			plugin = load(plugin);
		}
		let build = plugin(pluginConfig, assetManager,
				{ browsers, sourcemaps, compact });
		buckets[bucket].push(build);
	});

	let runner = new SerializedRunner(files => {
		return buildStep(buckets.static)(files).
			then(buildStep(buckets.scripts.concat(buckets.styles))).
			then(buildStep(buckets.markup));
	});
	runner.run();

	if(watch) {
		makeWatcher(config.watchDirs, referenceDir, assetManager.resolvePath).
			on("edit", filepaths => {
				runner.rerun(filepaths);
			});
	}
};

function buildStep(plugins) {
	return files => Promise.all(plugins.map(plugin => plugin(files))).
		then(() => files);
}

function makeWatcher(watchDirs, referenceDir, resolvePath) {
	let niteOwl = require("nite-owl");

	if(watchDirs) {
		watchDirs = watchDirs.map(dir => resolvePath(dir, { enforceRelative: true }));
	} else {
		watchDirs = [referenceDir];
		console.error(`you might consider setting ${repr("watchDirs", false)} ` +
				"to reduce CPU and energy consumption in watch mode");
	}

	let watcher = niteOwl(watchDirs);
	watcher.on("error", err => {
		if(err.code === "ERR_TOO_MANY_FILES") {
			abort("ERROR: there are too many files being monitored - please " +
					"use the `watchDirs` configuration setting");
		}
		throw err;
	});
	return watcher;
}

function load(pkg) {
	try {
		return require(pkg);
	} catch(err) {
		if(err.code !== "MODULE_NOT_FOUND") {
			throw err;
		}
		abort(`ERROR: missing plugin - please install ${repr(pkg)}`);
	}
}
