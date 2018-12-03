"use strict";

let readConfig = require("./config");
let { abort, repr } = require("./util");
let parseArgs = require("minimist");

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
`.trim();

module.exports = function parseCLI(argv = process.argv.slice(2), help = HELP) {
	argv = parseArgs(argv, {
		boolean: ["watch", "fingerprint", "sourcemaps", "compact"],
		alias: {
			c: "config",
			w: "watch",
			h: "help"
		}
	});

	if(argv.help) {
		abort(help, 0);
	}

	let options = {
		watch: argv.watch,
		fingerprint: argv.fingerprint,
		sourcemaps: argv.sourcemaps,
		compact: argv.compact
	};

	if(options.watch && options.fingerprint) { // for convenience
		console.error("you might consider disabling fingerprinting in watch " +
				"mode to avoid littering your file system with obsolete bundles");
	}

	let rootDir = process.cwd();
	let { referenceDir, config } = readConfig(rootDir, argv.config);
	return { referenceDir, config, options };
};
