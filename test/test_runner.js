/* global describe, it */
"use strict";

let SerializedRunner = require("../lib/util/runner");
let { strictEqual: assertSame, deepStrictEqual: assertDeep } = require("assert");

describe("watch mode", () => {
	it("avoids concurrent compilation, queueing recompilation", () => {
		let bundle = new MockBundle();

		bundle.compile(); // starts compilation
		bundle.compile(); // queues recompilation
		bundle.compile(); // skipped due to queue limit
		let prevLog; // keeps track of compilation sequence
		return bundle.compile(). // skipped due to queue limit
			then(() => {
				let log = bundle.executionLog;
				assertSame(log.length, 2); // compiled, then recompiled once
				prevLog = [].concat(log);

				bundle.compile(); // starts compilation
				bundle.compile(); // queues recompilation
				bundle.compile(); // skipped due to queue limit
				return bundle.compile(); // skipped due to queue limit
			}).
			then(() => {
				let log = bundle.executionLog;
				assertSame(log.length, 4); // compiled, then recompiled once
				assertDeep(log.slice(0, prevLog.length), prevLog);
				prevLog = [].concat(bundle.executionLog);

				return bundle.compile(); // starts compilation
			}).
			then(() => {
				let log = bundle.executionLog;
				assertSame(log.length, 5);
				assertDeep(log.slice(0, prevLog.length), prevLog);
				prevLog = [].concat(bundle.executionLog);
			});
	});
});

class MockBundle {
	constructor() {
		this.executionLog = [];
	}

	compile() {
		let id = Math.random();
		if(this._runner) {
			return this._runner.rerun(id);
		}

		this._runner = new SerializedRunner(id => this._compile(id));
		return this._runner.run(id);
	}

	_compile(id) {
		return wait(1).
			then(() => {
				if(id) {
					this.executionLog.push(id);
				}
			});
	}
}

function wait(delay) {
	return new Promise(resolve => {
		setTimeout(() => { resolve(); }, delay);
	});
}
