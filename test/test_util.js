"use strict";

let { generateFingerprint } = require("../lib/util");
let { describe, it } = require("node:test");
let assert = require("assert");

let assertSame = assert.strictEqual;

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
