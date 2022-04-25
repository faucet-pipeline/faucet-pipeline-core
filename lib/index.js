import { liveServer, staticServer } from "./server.js";
import { pluginsByBucket } from "./plugins.js";
import { AssetManager } from "./manager.js";
import { resolvePath } from "./util/resolve.js";
import { abort, repr } from "./util/index.js";
import { SerializedRunner } from "./util/runner.js";
import browserslist from "browserslist";

export async function faucetDispatch(referenceDir, config,
		{ watch, fingerprint, sourcemaps, compact, serve, liveserve }) {
	config = await config;

	let assetManager = new AssetManager(referenceDir, {
		manifestConfig: config.manifest,
		fingerprint,
		exitOnError: !watch
	});
	let browsers = browserslist.findConfig(referenceDir) || {};
	if(browsers.substr) {
		browsers = [browsers];
	}

	let plugins = await pluginsByBucket(config);
	// initialize plugins with corresponding configuration
	let buckets = Object.keys(plugins).reduce((memo, bucket) => {
		memo[bucket] = plugins[bucket].map(({ plugin, config }) => {
			return plugin(config, assetManager, { browsers, sourcemaps, compact });
		});
		return memo;
	}, {});

	let runner = new SerializedRunner(files => {
		return buildStep(buckets.static)(files).
			then(buildStep(buckets.scripts.concat(buckets.styles))).
			then(buildStep(buckets.markup));
	});
	runner.run();

	if(watch) {
		makeWatcher(config.watchDirs, referenceDir).
			then(watcher => {
				watcher.on("edit", filepaths => {
					runner.rerun(filepaths);
				});
			});
	}

	if(serve && liveserve) {
		abort("ERROR: serve and liveserve must not be used together");
	}
	if(serve) {
		staticServer(serve, assetManager.manifest.webRoot);
	} else if(liveserve) {
		liveServer(liveserve, assetManager.manifest.webRoot);
	}
}

function buildStep(plugins) {
	return files => Promise.all(plugins.map(plugin => plugin(files))).
		then(() => files);
}

async function makeWatcher(watchDirs, referenceDir) {
	let niteOwl = await import("nite-owl");

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
