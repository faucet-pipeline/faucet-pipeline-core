"use strict";

let { abort, repr } = require("../util");
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
  --compact
    reduce output size (e.g. via minification)
`.trim();

module.exports = function parseCLI(argv = process.argv.slice(2), help = HELP) {
	argv = parseArgs(argv, {
		alias: {
			c: "config",
			w: "watch",
			h: "help"
		}
	});

	if(argv.help) {
		abort(help, 0);
	}

	let options = ["watch", "fingerprint", "compact"].reduce((memo, option) => {
		let value = argv[option];
		if(value !== undefined) {
			memo[option] = value;
		}
		return memo;
	}, {});

	if(options.watch && options.fingerprint) { // for convenience
		console.error("you might consider disabling fingerprinting in watch " +
				"mode to avoid littering your file system with obsolete bundles");
	}

	return {
		rootDir: process.cwd(),
		config: argv.config,
		options
	};
};
