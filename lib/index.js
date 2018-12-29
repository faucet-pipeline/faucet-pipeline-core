"use strict";

let AssetManager = require("./manager");
let resolvePath = require("./util/resolve");
let { loadExtension, abort, repr } = require("./util");
let browserslist = require("browserslist");
let SerializedRunner = require("./util/runner");
let server = require("./server");

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
		},
		nunjucks: {
			plugin: "faucet-pipeline-nunjucks",
			bucket: "markup"
		}
	}
};

module.exports = (referenceDir, config, { watch, fingerprint, sourcemaps, compact, serve, liveserve }) => {
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
			plugin = loadExtension(plugin, "ERROR: missing plugin");
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
		makeWatcher(config.watchDirs, referenceDir).
			on("edit", filepaths => {
				runner.rerun(filepaths);
			});
	}

	if(serve && liveserve) {
		abort("ERROR: You can't use serve and liveserve at once");
	}
	if(serve) {
		server.static(serve, assetManager.manifest.webRoot);
	}
	if(liveserve) {
		server.live(liveserve, assetManager.manifest.webRoot);
	}
};

function buildStep(plugins) {
	return files => Promise.all(plugins.map(plugin => plugin(files))).
		then(() => files);
}

function makeWatcher(watchDirs, referenceDir) {
	let niteOwl = require("nite-owl");

	if(watchDirs) {
		watchDirs = watchDirs.map(dir => resolvePath(dir, referenceDir,
				{ enforceRelative: true }));
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
