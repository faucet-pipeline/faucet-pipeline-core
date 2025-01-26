"use strict";

let readConfig = require("./config");
let { abort, repr } = require("./util");
let { parseArgs } = require("node:util");

let HELP = `
Usage:
  $ faucet [options]

Options:
  -h, --help
    display this help message
  -c, --config
    configuration file (defaults to ${repr("faucet.config.js")})
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
  --liveserve [HOST:]PORT
    serve generated files via HTTP with live reloading
`.trim();

module.exports = function parseCLI() {
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
			liveserve: {
				type: "string"
			}
		}
	});

	if(values.help) {
		abort(HELP, 0);
	}

	let options = {
		watch: values.watch,
		fingerprint: values.fingerprint,
		sourcemaps: values.sourcemaps,
		compact: values.compact,
		serve: values.serve,
		liveserve: values.liveserve
	};

	if(options.watch && options.fingerprint) { // for convenience
		console.error("you might consider disabling fingerprinting in watch " +
				"mode to avoid littering your file system with obsolete bundles");
	}

	let rootDir = process.cwd();
	let { referenceDir, config } = readConfig(rootDir, values.config);
	return { referenceDir, config, options };
};
