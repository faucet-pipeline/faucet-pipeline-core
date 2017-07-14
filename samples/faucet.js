let targetDir = "dist";
let baseURI = "/assets";

let sass = {
	targetDir,
	manifest: {
		file: "dist/css.json",
		baseURI
	},
	assets: ["images.json"],
	prefixes: {
		browsers: ["last 2 versions", "Chrome 21"]
	},
	bundles: [{
		entryPoint: "sass/foo.scss"
	}, {
		entryPoint: "sass/bar.scss"
	}]
};

let js = {
	targetDir,
	manifest: {
		file: "dist/js.json",
		baseURI
	},
	bundles: [{
		entryPoint: "js/foo.js",
		transpiler: {
			features: ["es2015"]
		}
	}, {
		entryPoint: "js/bar.js"
	}]
};

module.exports = { sass, js };
