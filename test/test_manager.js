"use strict";

let { AssetManager } = require("../lib/manager");
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
