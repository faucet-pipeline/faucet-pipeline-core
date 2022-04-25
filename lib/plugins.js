"use strict";

let { loadExtension, abort, repr } = require("./util");

// common plugins included for convenience
let DEFAULTS = [{
	key: "js",
	bucket: "scripts",
	plugin: "faucet-pipeline-js"
}, {
	key: "sass",
	bucket: "styles",
	plugin: "faucet-pipeline-sass"
}, {
	key: "static",
	bucket: "static",
	plugin: "faucet-pipeline-static"
}, {
	key: "images",
	bucket: "static",
	plugin: "faucet-pipeline-images"
}];
let DEFAULT_KEYS = DEFAULTS.reduce((memo, plugin) => {
	memo.add(plugin.key);
	return memo;
}, new Set());
let BUCKETS = new Set(["static", "scripts", "styles", "markup"]);

module.exports = {
	pluginsByBucket,
	_determinePlugins: determinePlugins
};

// returns plugin functions grouped by bucket and filtered by relevance (based
// on configuration)
async function pluginsByBucket(config, defaults) {
	let plugins = await determinePlugins(config.plugins, defaults);
	let buckets = [...BUCKETS].reduce((memo, bucket) => {
		memo[bucket] = [];
		return memo;
	}, {});
	for(let [key, _plugin] of Object.entries(plugins)) {
		let pluginConfig = config[key];
		if(!pluginConfig) {
			continue;
		}

		let { bucket, plugin } = _plugin;
		if(!plugin.call) {
			({ plugin } = await loadPlugin(plugin));
		}
		buckets[bucket].push({
			plugin,
			config: pluginConfig
		});
	}
	return buckets;
}

// `plugins` is an array of plugins, each either a package identifier or a
// `{ key, bucket, plugin }` object`, with `key` being the configuration key and
// `plugin` being either a function or a package identifier
async function determinePlugins(plugins = [], defaults = DEFAULTS) {
	let registry = {};
	// NB: default plugins are resolved lazily because eager loading would
	//     result in them becoming a hard dependency rather than a convenience
	//     preset - however, that requires us to duplicate the respective
	//     configuration keys and buckets here
	for(let plugin of defaults) {
		await registerPlugin(registry, plugin, false);
	}
	for(let plugin of plugins) {
		await registerPlugin(registry, plugin, true);
	}
	return registry;
}

async function registerPlugin(registry, _plugin, eager) {
	let { key, bucket, plugin } = await resolvePlugin(_plugin, eager);
	// NB: default plugins may be overridden
	if(registry[key] && !DEFAULT_KEYS.has(key)) {
		abort(`ERROR: duplicate plugin key ${repr(key, false)}`);
	}
	let entry = registry[key] = { bucket, plugin };
	if(!eager) {
		entry.default = true;
	}
}

async function resolvePlugin(_plugin, eager) {
	if(_plugin.substr) { // package identifier
		_plugin = await loadPlugin(_plugin);
	}

	let { key, bucket, plugin } = _plugin;
	if(eager && plugin.substr && (!key || !bucket)) { // auto-configuration
		let _plugin = await loadPlugin(plugin);
		plugin = _plugin.plugin;
		// local configuration takes precedence
		key = key || _plugin.key;
		bucket = bucket || _plugin.bucket;
	}

	if(!BUCKETS.has(bucket)) {
		abort(`ERROR: invalid plugin bucket ${repr(bucket, false)}`);
	}
	return { key, bucket, plugin };
}

async function loadPlugin(pkg) {
	let fail = prop => abort(`ERROR: invalid plugin ${repr(pkg)}; ` +
			`missing ${repr(prop, false)}`);
	let {
		key = fail("key"),
		bucket = fail("bucket"),
		plugin = fail("plugin")
	} = await loadExtension(pkg, "ERROR: missing plugin");
	return { key, bucket, plugin };
}
