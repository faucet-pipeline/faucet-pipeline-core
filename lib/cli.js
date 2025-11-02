"use strict";

let { abort, repr } = require("./util");
let { parseArgs } = require("node:util");
let path = require("node:path");

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
				short: "c",
				default: "faucet.config.js"
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

	let configPath = path.resolve(process.cwd(), values.config);
	return {
		referenceDir: path.dirname(configPath),
		config: await require(configPath),
		options: values
	};
};
