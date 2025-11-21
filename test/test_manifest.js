"use strict";

let { Manifest } = require("../lib/manifest");
let { describe, it, before, after } = require("node:test");
let path = require("path");
let assert = require("assert");

let assertDeep = assert.deepStrictEqual;

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
				assertDeep(manifest.entries, {
					"foo.png": "/foo-abc123.png"
				});

				return manifest.set("bar.css", "bar-def456.css");
			}).
			then(() => {
				assertDeep(manifest.entries, {
					"foo.png": "/foo-abc123.png",
					"bar.css": "/bar-def456.css"
				});

				return manifest.set("xox.js", "xox-ghi789.js");
			}).
			then(() => {
				assertDeep(manifest.entries, {
					"foo.png": "/foo-abc123.png",
					"bar.css": "/bar-def456.css",
					"xox.js": "/xox-ghi789.js"
				});
			});
	});
});
