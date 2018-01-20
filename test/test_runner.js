/* global describe, it */
"use strict";

let SerializedRunner = require("../lib/util/runner");
let assert = require("assert");

let assertSame = assert.strictEqual;

describe("watch mode", _ => {
	it("avoids concurrent compilation, queueing recompilation", () => {
		let bundle = new MockBundle();

		bundle.compile(); // starts compilation
		bundle.compile(); // queues recompilation
		bundle.compile(); // skipped due to queue limit
		return bundle.compile(). // skipped due to queue limit
			then(_ => {
				assertSame(bundle.executionCount, 2); // compiled, then recompiled once

				bundle.compile(); // starts compilation
				bundle.compile(); // queues recompilation
				bundle.compile(); // skipped due to queue limit
				return bundle.compile(); // skipped due to queue limit
			}).
			then(_ => {
				assertSame(bundle.executionCount, 4); // compiled, then recompiled once

				return bundle.compile(); // starts compilation
			}).
			then(_ => {
				assertSame(bundle.executionCount, 5);
			});
	});
});

class MockBundle {
	constructor() {
		this.executionCount = 0;
	}

	compile() {
		if(this._runner) {
			return this._runner.rerun();
		}

		this._runner = new SerializedRunner(_ => this._compile());
		return this._runner.run();
	}

	_compile() {
		return wait(1).
			then(_ => {
				this.executionCount++;
			});
	}
}

function wait(delay) {
	return new Promise(resolve => {
		setTimeout(_ => { resolve(); }, delay);
	});
}
