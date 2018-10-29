/* global describe, before, after, it */
"use strict";

let AssetManager = require("../lib/manager");
let path = require("path");
let assert = require("assert");

let assertSame = assert.strictEqual;

describe("asset manager", _ => {
	let root = path.resolve(__dirname, "fixtures");
	let cwd;

	before(() => {
		cwd = process.cwd();
		process.chdir(root);
	});

	after(() => {
		process.chdir(cwd);
	});

	it("resolves file paths for local modules and third-party packages", () => {
		let { resolvePath } = new AssetManager(root);

		let filepath = resolvePath("dummy/src.js");
		assertSame(path.relative(root, filepath), "dummy/src.js");

		filepath = resolvePath("dummy/pkg.js");
		assertSame(path.relative(root, filepath), "node_modules/dummy/pkg.js");

		// local modules take precedence over third-party packages
		["dummy", "dummy/index", "dummy/index.js"].forEach(module => {
			let filepath = resolvePath(module);
			assertSame(path.relative(root, filepath), "dummy/index.js");
		});
	});
});
