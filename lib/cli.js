"use strict";

let { abort, repr } = require("./util");
let path = require("node:path");
let { parseArgs } = require("node:util");

let DEFAULT_CONFIG = "faucet.config.js";
let HELP = `
Usage:
  $ faucet [options]

Options:
  -h, --help
    display this help message
  -c, --config
    configuration file (defaults to ${repr(DEFAULT_CONFIG)})
  -w, --watch
    monitor the file system for changes to recompile automatically
  --fingerprint
    add unique hash to file names
  --sourcemaps
    generate source maps (where supported)
  --compact
    reduce output size (where supported)
  --serve [HOST:]PORT
    serve generated files via HTTP
`.trim();

exports.parseCLI = async function parseCLI() {
	let { values } = parseArgs({
		options: {
			help: {
				type: "boolean",
				short: "h",
				default: false
			},
			config: {
				type: "string",
				short: "c"
			},
			watch: {
				type: "boolean",
				short: "w",
				default: false
			},
			fingerprint: {
				type: "boolean",
				default: false
			},
			sourcemaps: {
				type: "boolean",
				default: false
			},
			compact: {
				type: "boolean",
				default: false
			},
			serve: {
				type: "string"
			},
			liveserve: { // NB: removed; see below
				type: "string"
			}
		}
	});

	let { help, config: configFile, liveserve, ...options } = values;
	if(help) {
		abort(HELP, 0);
	}
	if(liveserve) {
		abort("The `--liveserve` option was removed. Please use `--serve` instead", 0);
	}

	let rootDir = process.cwd();
	let { referenceDir, config } = await readConfig(rootDir, configFile);
	return { referenceDir, config, options };
};

async function readConfig(rootDir, filepath = DEFAULT_CONFIG) {
	let configPath = path.resolve(rootDir, filepath);
	return {
		referenceDir: path.dirname(configPath),
		config: await require(configPath)
	};
}
