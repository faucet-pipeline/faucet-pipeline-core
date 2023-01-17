/* global describe, before, after, it */
"use strict";

let Manifest = require("../lib/manifest");
let path = require("path");
let assert = require("assert");

let assertSame = assert.strictEqual;

describe("manifest", () => {
	let root = path.resolve(__dirname, "fixtures");
	let cwd;

	before(() => {
		cwd = process.cwd();
		process.chdir(root);
	});

	after(() => {
		process.chdir(cwd);
	});

	it("maps original to actual file names with deterministic serialization", () => {
		let manifest = new Manifest(root);
		return manifest.set("foo.png", "foo-abc123.png").
			then(() => {
				assertSame(JSON.stringify(manifest), '{"foo.png":"/foo-abc123.png"}');

				return manifest.set("bar.css", "bar-def456.css");
			}).
			then(() => {
				assertSame(JSON.stringify(manifest),
						'{"bar.css":"/bar-def456.css","foo.png":"/foo-abc123.png"}');

				return manifest.set("xox.js", "xox-ghi789.js");
			}).
			then(() => {
				assertSame(JSON.stringify(manifest), // eslint-disable-next-line max-len
						'{"bar.css":"/bar-def456.css","foo.png":"/foo-abc123.png","xox.js":"/xox-ghi789.js"}');
			});
	});
});
