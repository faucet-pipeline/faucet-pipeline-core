let path = require("path");
let { createFile, generateFingerprint, uriJoin } = require("faucet-pipeline-util");
let retry = require("./retry");
let retryTimings = [10, 50, 100, 250, 500, 1000];

class Manifest {
	constructor(config, fingerprint, configDir, exitOnError) {
		this.config = config;
		this.manifest = {};
		this.fingerprint = fingerprint;
		this.configDir = configDir;
		this.exitOnError = exitOnError;
	}

	add(targetPath, content, opts = {}) {
		let target = opts.target || path.dirname(targetPath);
		let error = opts.error;
		let outputPath = targetPath;

		if(this.fingerprint) {
			let fileName = path.basename(targetPath);
			outputPath = path.join(path.dirname(targetPath),
					generateFingerprint(fileName, content));
		}

		return createFile(outputPath, content).then(_ => {
			this.report(outputPath, error);
			return this.writeManifest(targetPath, outputPath, target);
		}).then(_ => {
			if(error && this.exitOnError) {
				process.exit(1);
			}
		});
	}

	lookup(targetPath) {
		return retry(this._lookup.bind(this), retryTimings)(targetPath);
	}

	_lookup(targetPath) {
		return new Promise((resolve, reject) => {
			if(this.manifest[targetPath]) {
				resolve(this.manifest[targetPath]);
			} else {
				reject(new Error(`Could not find asset '${targetPath}'`));
			}
		});
	}

	report(outputPath, error) {
		let relativeOutputPath = path.relative(this.configDir, outputPath);
		if(error) {
			console.warn(`✗ ${relativeOutputPath}: ${error.message}`);
		} else {
			console.log(`✓ ${relativeOutputPath}`); // eslint-disable-line no-console
		}
	}

	writeManifest(targetPath, outputPath, target) {
		if(!this.config) {
			return;
		}

		this.manifest[path.relative(this.configDir, targetPath)] =
			this.buildURI(
					path.relative(this.configDir, outputPath),
					path.relative(target, outputPath)
			);

		let manifestLocation = path.join(this.configDir, this.config.file);
		return createFile(manifestLocation, `${JSON.stringify(this.manifest)}\n`);
	}

	buildURI(bundlePath, filePath) {
		if(this.config.baseURI.call) {
			return this.config.baseURI(bundlePath, filePath);
		} else {
			return uriJoin(this.config.baseURI, bundlePath);
		}
	}
}

module.exports = Manifest;
