/* global describe, it */
"use strict";

let { generateFingerprint } = require("../lib/util");
let FileFinder = require("../lib/util/files/finder");
let assert = require("assert");
let path = require("path");

let assertSame = assert.strictEqual;
let assertDeepEqual = assert.deepEqual;

describe("fingerprinting", _ => {
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

describe("FileFinder", _ => {
	it("finds all files within a folder", done => {
		let fixturePath = path.resolve("test/fixtures");
		let fileFinder = new FileFinder(fixturePath);

		fileFinder.all().then(allFiles => {
			assertDeepEqual(allFiles, [
				"dummy/.keep",
				"dummy/index.js",
				"dummy/src.js",
				"node_modules/dummy/index.js",
				"node_modules/dummy/pkg.js"
			]);
			done();
		});
	});

	it("finds all files within a folder without dotfiles", done => {
		let fixturePath = path.resolve("test/fixtures");
		let fileFinder = new FileFinder(fixturePath, { skipDotfiles: true });

		fileFinder.all().then(allFiles => {
			assertDeepEqual(allFiles, [
				"dummy/index.js",
				"dummy/src.js",
				"node_modules/dummy/index.js",
				"node_modules/dummy/pkg.js"
			]);
			done();
		});
	});

	it("finds all files within a folder with a filter", done => {
		let fixturePath = path.resolve("test/fixtures");
		let fileFinder = new FileFinder(fixturePath, {
			filter: filename => path.basename(filename) === "index.js"
		});

		fileFinder.all().then(allFiles => {
			assertDeepEqual(allFiles, [
				"dummy/index.js",
				"node_modules/dummy/index.js"
			]);
			done();
		});
	});

	it("matches given files", done => {
		let fixturePath = path.resolve("test/fixtures");
		let fileFinder = new FileFinder(fixturePath);
		let foo = [
			path.resolve("test/fixtures/dummy/index.js"),
			path.resolve("test/fixtures/something.js"),
			path.resolve("test/other/something.js")
		];

		fileFinder.match(foo).then(allFiles => {
			assertDeepEqual(allFiles, [
				"dummy/index.js",
				"something.js"
			]);
			done();
		});
	});

	it("matches given files without dotfiles", done => {
		let fixturePath = path.resolve("test/fixtures");
		let fileFinder = new FileFinder(fixturePath, { skipDotfiles: true });
		let foo = [
			path.resolve("test/fixtures/.secret")
		];

		fileFinder.match(foo).then(allFiles => {
			assertDeepEqual(allFiles, []);
			done();
		});
	});

	it("matches given files without dotfiles", done => {
		let fixturePath = path.resolve("test/fixtures");
		let fileFinder = new FileFinder(fixturePath, {
			filter: filename => path.basename(filename) === "index.js"
		});
		let foo = [
			path.resolve("test/fixtures/index.js"),
			path.resolve("test/fixtures/something.js")
		];

		fileFinder.match(foo).then(allFiles => {
			assertDeepEqual(allFiles, [ "index.js" ]);
			done();
		});
	});
});
