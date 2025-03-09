"use strict";

exports.SerializedRunner = class SerializedRunner {
	constructor(asyncOp) {
		this.asyncOp = asyncOp;
	}

	run(...args) {
		if(!this._pending) { // prevent concurrent execution
			this._pending = this.asyncOp(...args).
				finally(() => {
					this._pending = null;
				});
		}
		return this._pending;
	}

	// repeats execution exactly once after waiting for any pending execution to conclude
	rerun(...args) {
		if(this._queued) { // limit queue to a single repeat execution
			return this._queued;
		}

		let enqueue = this._pending;
		let res = this.run(...args);
		if(enqueue) {
			this._queued = res = res.
				finally(() => {
					this._queued = null;
				}).
				then(() => this.run(...args));
		}
		return res;
	}
};
