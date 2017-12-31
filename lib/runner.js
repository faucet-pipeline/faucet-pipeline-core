"use strict";

module.exports = class SerializedRunner {
	constructor(asyncOp) {
		this.asyncOp = asyncOp;
	}

	run() {
		if(!this._pending) { // prevent concurrent execution
			this._pending = augment(this.asyncOp()).
				finally(_ => {
					this._pending = null;
				});
		}
		return this._pending;
	}

	// repeats execution exactly once after waiting for any pending execution to conclude
	rerun() {
		if(this._queued) { // limit queue to a single repeat execution
			return this._queued;
		}

		let enqueue = this._pending;
		let res = this.run();
		if(enqueue) {
			this._queued = res = augment(res).
				finally(_ => {
					this._queued = null;
				}).
				then(_ => this.run());
		}
		return res;
	}
};

function augment(promise) {
	promise.finally = always;
	return promise;
}

// poor man's `Promise#finally` polyfill
function always(fn) {
	return this.
		then(res => {
			fn();
			return res;
		}, err => {
			fn();
			throw err;
		});
}
