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
		let error = opts.error;
		let outputPath = targetPath;

		if(this.fingerprint) {
			let fileName = path.basename(targetPath);
			outputPath = path.join(path.dirname(targetPath),
					generateFingerprint(fileName, content));
		}

		return createFile(outputPath, content).then(_ => {
			this.report(outputPath, error);
			return this.writeManifest(targetPath, outputPath);
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

	writeManifest(targetPath, outputPath) {
		if(!this.config) {
			return;
		}

		this.manifest[path.relative(this.configDir, targetPath)] =
			this.buildURI(outputPath);

		let manifestLocation = path.join(this.configDir, this.config.file);
		return createFile(manifestLocation, `${JSON.stringify(this.manifest)}\n`);
	}

	buildURI(outputPath) {
		let baseURI = this.config.baseURI || "";
		let webRoot = this.config.webRoot || this.configDir;
		let relativePath = path.relative(webRoot, outputPath);
		return uriJoin(baseURI, relativePath);
	}
}

module.exports = Manifest;
