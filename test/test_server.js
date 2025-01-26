/* global describe, before, after, it */
import { _parseHost } from "../lib/server.js";
import assert, { strictEqual as assertSame } from "assert";

describe("server host parsing", () => {
	let { exit } = process;

	before(() => {
		process.exit = code => {
			throw new Error(`exit ${code}`);
		};
	});

	after(() => {
		process.exit = exit;
	});

	it("determines host/port based on CLI parameter", () => {
		let [host, port] = _parseHost(true);
		assertSame(host, "localhost");
		assertSame(port, 3000);

		[host, port] = _parseHost(8080);
		assertSame(host, "localhost");
		assertSame(port, 8080);

		[host, port] = _parseHost(":8080");
		assertSame(host, "localhost");
		assertSame(port, 8080);

		[host, port] = _parseHost("localhost:8080");
		assertSame(host, "localhost");
		assertSame(port, 8080);

		assert.throws(() => {
			_parseHost("localhost");
		}, /exit 1/);
	});
});
