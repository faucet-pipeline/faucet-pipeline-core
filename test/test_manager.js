"use strict";

let { AssetManager, generateFingerprint } = require("../lib/manager");
let { describe, it, before, after } = require("node:test");
let path = require("path");
let assert = require("assert");

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
		let fingerprint = generateFingerprint("/path/to/foo.js", "lorem ipsum");
		assertSame(fingerprint, "/path/to/foo-80a751fde577028640c419000e33eba6.js");

		fingerprint = generateFingerprint("/path/to/bar.js", "dolor sit amet");
		assertSame(fingerprint, "/path/to/bar-7afed6210e0b8fce023f06abd4490fa0.js");
	});

	it("supports files without extension", () => {
		let fingerprint = generateFingerprint("/path/to/baz", "lipsum");
		assertSame(fingerprint, "/path/to/baz-8047cfaac755e5c7f77af066123980a5");
	});
});
