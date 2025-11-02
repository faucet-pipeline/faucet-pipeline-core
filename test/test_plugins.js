"use strict";

let { pluginsByBucket, _determinePlugins } = require("../lib/plugins");
let { describe, it, before, after } = require("node:test");
let path = require("path");
let assert = require("assert");

let { deepStrictEqual: assertDeep } = assert;

let ROOT = path.resolve(__dirname, "fixtures");
let DEFAULTS = {
	assets: {
		bucket: "static",
		plugin: "faucet-pipeline-assets"
	},
	js: {
		bucket: "scripts",
		plugin: "faucet-pipeline-js"
	},
	css: {
		bucket: "styles",
		plugin: "faucet-pipeline-css"
	},
	sass: {
		bucket: "styles",
		plugin: "faucet-pipeline-sass"
	},
	images: {
		bucket: "static",
		plugin: "faucet-pipeline-images"
	}
};

let { NODE_PATH } = process.env;
let CUSTOM_NODE_PATH = path.resolve(ROOT, "node_modules");

describe("plugin registration", () => {
	before(() => {
		updateNodePath(NODE_PATH, CUSTOM_NODE_PATH);
	});

	after(() => {
		updateNodePath(NODE_PATH);
	});

	it("only loads default plugins referenced within configuration", async () => {
		let res = await pluginsByBucket({
			js: [{ foo: "lorem" }]
		});
		assertDeep(normalizeAll(res), {
			static: [],
			scripts: [{
				plugin: "<Function faucetJS>",
				config: [{ foo: "lorem" }]
			}],
			styles: [],
			markup: []
		});

		res = await pluginsByBucket({
			sass: [{ bar: "ipsum" }]
		});
		assertDeep(normalizeAll(res), {
			static: [],
			scripts: [],
			styles: [{
				plugin: "<Function faucetSass>",
				config: [{ bar: "ipsum" }]
			}],
			markup: []
		});

		res = await pluginsByBucket({
			js: [{ foo: "lorem" }],
			sass: [{ bar: "ipsum" }]
		});
		assertDeep(normalizeAll(res), {
			static: [],
			scripts: [{
				plugin: "<Function faucetJS>",
				config: [{ foo: "lorem" }]
			}],
			styles: [{
				plugin: "<Function faucetSass>",
				config: [{ bar: "ipsum" }]
			}],
			markup: []
		});
	});

	it("allows overriding default plugins", async () => {
		let res = await pluginsByBucket({
			js: [{ foo: "bar" }],
			plugins: [{
				key: "js",
				bucket: "static",
				plugin: "faucet-pipeline-dummy"
			}]
		});
		assertDeep(normalizeAll(res), {
			static: [{
				plugin: "<Function faucetDummy>",
				config: [{ foo: "bar" }]
			}],
			scripts: [],
			styles: [],
			markup: []
		});
	});
});

describe("plugin resolution", () => {
	let { exit } = process;

	before(() => {
		process.exit = code => {
			throw new Error(`exit ${code}`);
		};
		updateNodePath(NODE_PATH, CUSTOM_NODE_PATH);
	});

	after(() => {
		process.exit = exit;
		updateNodePath(NODE_PATH);
	});

	it("provides a default set of plugins", async () => {
		let res = await _determinePlugins();
		assertDeep(normalizePlugins(res), DEFAULTS);
	});

	it("supports custom plugins", async () => {
		// plugin function within configuration
		let anon = () => {};
		let config = [{
			key: "dummy",
			bucket: "static",
			plugin: anon
		}];
		let res = await _determinePlugins(config);
		assertDeep(normalizePlugins(res), Object.assign({}, DEFAULTS, {
			dummy: {
				bucket: "static",
				plugin: "<Function anon>"
			}
		}));

		// nested package identifier
		let pkg = "faucet-pipeline-dummy";
		config[0].plugin = pkg;
		res = await _determinePlugins(config);
		assertDeep(normalizePlugins(res), Object.assign({}, DEFAULTS, {
			dummy: {
				bucket: "static",
				// NB: plugin not loaded due to comprehensive local configuration
				plugin: "faucet-pipeline-dummy"
			}
		}));

		// simple package identifier
		res = await _determinePlugins([pkg]);
		assertDeep(normalizePlugins(res), Object.assign({}, DEFAULTS, {
			dummy: {
				bucket: "static",
				plugin: "<Function faucetDummy>"
			}
		}));
	});

	it("allows overriding plugins' default configuration", async () => {
		let config = [{
			key: "yummy",
			plugin: "faucet-pipeline-dummy"
		}];
		let res = await _determinePlugins(config);
		assertDeep(normalizePlugins(res), Object.assign({}, DEFAULTS, {
			yummy: {
				bucket: "static",
				plugin: "<Function faucetDummy>"
			}
		}));

		config[0].bucket = "styles";
		res = await _determinePlugins(config);
		assertDeep(normalizePlugins(res), Object.assign({}, DEFAULTS, {
			yummy: {
				bucket: "styles",
				// NB: plugin not loaded due to comprehensive local configuration
				plugin: "faucet-pipeline-dummy"
			}
		}));
	});

	it("balks at invalid package identifiers", async () => {
		await assert.rejects(async () => {
			return _determinePlugins(["faucet-pipeline-yummy"]);
		}, /exit 1/);

		await assert.rejects(() => {
			return _determinePlugins([{
				// NB: local configuration must not be comprehensive to ensure
				//     plugin is loaded
				key: "yummy",
				plugin: "faucet-pipeline-yummy"
			}]);
		}, /exit 1/);
	});

	it("balks at duplicate configuration keys", async () => {
		await assert.rejects(() => {
			return _determinePlugins([{
				key: "dummy",
				bucket: "static",
				plugin: () => {}
			}, {
				key: "dummy",
				bucket: "styles",
				plugin: () => {}
			}]);
		}, /exit 1/);
	});

	it("balks at invalid plugins", async () => {
		await assert.rejects(() => {
			return _determinePlugins(["faucet-pipeline-invalid-a"]);
		}, /exit 1/);

		await assert.rejects(() => {
			return _determinePlugins(["faucet-pipeline-invalid-b"]);
		}, /exit 1/);

		await assert.rejects(() => {
			return _determinePlugins(["faucet-pipeline-invalid-c"]);
		}, /exit 1/);
	});

	it("balks at invalid buckets", async () => {
		let plugin = {
			key: "dummy",
			plugin: () => {}
		};
		const buckets = ["static", "scripts", "styles", "markup"];
		for(let bucket of buckets) {
			plugin.bucket = bucket;
			await assert.doesNotReject(async () => {
				return _determinePlugins([plugin]);
			}, /exit 1/);
		}

		plugin.bucket = "dummy";
		await assert.rejects(async () => {
			return _determinePlugins([plugin]);
		}, /exit 1/);
	});
});

function normalizeAll(pluginsByBucket) {
	Object.entries(pluginsByBucket).forEach(([bucket, plugins]) => {
		normalizePlugins(plugins);
	});
	return pluginsByBucket;
}

// serializes plugin functions for comparison purposes
function normalizePlugins(obj) {
	Object.entries(obj).forEach(([key, plugin]) => {
		delete plugin.default; // XXX: hacky

		let fn = plugin.plugin;
		if(fn.call) {
			plugin.plugin = `<Function ${fn.name}>`;
		}
	});
	return obj;
}

function updateNodePath(...paths) {
	process.env.NODE_PATH = paths.join(":");
	require("module").Module._initPaths();
}
