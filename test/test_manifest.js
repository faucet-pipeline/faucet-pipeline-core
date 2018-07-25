/* global describe, beforeEach, it */
"use strict";

let Manifest = require("../lib/manifest");
let assert = require("assert");

let assertSame = assert.strictEqual;

describe("asset manager", _ => {
	let manifest;

	beforeEach(() => {
		let options = {
			key: x => x,
			value: x => x
		};
		manifest = new Manifest("manifest.json", options, function() {});
	});

	it("should be able to get a value that is not set yet", done => {
		manifest.get("key").then(value => {
			assertSame(value, undefined);
			done();
		});
	});

	it("should be able to set a value and get it back again", done => {
		manifest.set("key", "value");
		manifest.get("key").then(value => {
			assertSame(value, "value");
			done();
		});
	});

	it("should be able to mark as in progress, then call get and then set", done => {
		manifest.inProgress("key");
		manifest.get("key").then(value => {
			assertSame(value, "value");
			done();
		});
		manifest.set("key", "value");
	});

	it("should be able to mark as in progress, then call set and then get", done => {
		manifest.inProgress("key");
		manifest.set("key", "value");
		manifest.get("key").then(value => {
			assertSame(value, "value");
			done();
		});
	});
});
