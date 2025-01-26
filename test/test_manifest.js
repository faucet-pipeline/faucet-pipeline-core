/* global describe, before, after, it */
import { Manifest } from "../lib/manifest.js";
import { fileURLToPath } from "url";
import path from "path";
import { strictEqual as assertSame } from "assert";

let ROOT = path.dirname(fileURLToPath(import.meta.url));

describe("manifest", () => {
	let root = path.resolve(ROOT, "fixtures");
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
