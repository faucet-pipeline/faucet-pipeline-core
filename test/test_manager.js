"use strict";

let { AssetManager, _generateFingerprint } = require("../lib/manager");
let { describe, it, before, after } = require("node:test");
let path = require("node:path");
let assert = require("node:assert");

let assertSame = assert.strictEqual;

describe("asset manager", () => {
	let root = path.resolve(__dirname, "fixtures");
	let cwd;
	let { exit } = process;

	before(() => {
		cwd = process.cwd();
		process.chdir(root);
		process.exit = code => {
			throw new Error(`exit ${code}`);
		};
	});

	after(() => {
		process.chdir(cwd);
		process.exit = exit;
	});

	it("resolves file paths for third-party packages", () => {
		let { resolvePath } = new AssetManager(root);

		let filepath = resolvePath("dummy/pkg.js");
		assertSame(path.relative(root, filepath), "node_modules/dummy/pkg.js");

		filepath = resolvePath("./dummy/src.js");
		assertSame(path.relative(root, filepath), "dummy/src.js");

		assert.throws(() => {
			resolvePath("dummy/src.js");
		}, /exit 1/);

		["dummy", "dummy/index", "dummy/index.js"].forEach(module => {
			let filepath = resolvePath(module);
			assertSame(path.relative(root, filepath), "node_modules/dummy/index.js");
		});

		filepath = resolvePath("dummy/images");
		assertSame(path.relative(root, filepath), "node_modules/dummy/images");

		assert.throws(() => {
			resolvePath("dummy/videos");
		}, /exit 1/);
	});
});

describe("fingerprinting", () => {
	it("generates a content-dependent hash", () => {
		let fingerprint = _generateFingerprint("/path/to/foo.js", "lorem ipsum");
		assertSame(fingerprint, "/path/to/foo-5e2bf57d3f40c4b6df69daf1936cb766f832374b4fc0259a7cbff06e2f70f269.js");

		fingerprint = _generateFingerprint("/path/to/bar.js", "dolor sit amet");
		assertSame(fingerprint, "/path/to/bar-aa8311d08b68a5fdda55ad0947fff3c5a4b2397f5f766e9c9a79f4a5486c633c.js");
	});

	it("supports files without extension", () => {
		let fingerprint = _generateFingerprint("/path/to/baz", "lipsum");
		assertSame(fingerprint, "/path/to/baz-832b7bbc3786888cd1105828577189fc96495da5bd37b84e85e820f490c53cc8");
	});
});
