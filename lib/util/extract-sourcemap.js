let { readFileSync } = require("fs");
let regex = /sourceMappingURL=data:application\/json;base64,(\S+)/;

// Extract the given attributes of a sourcemap as JSON from a given source file
//
// Exported as a global so it can be used with node -r
global.extractSourcemap = (fileName, attributes) => {
	let result = regex.exec(readFileSync(fileName));
	if(!result) {
		throw new Error("No Source Map found");
	}
	let sourceMapBuffer = Buffer.from(result[1], "base64");
	let sourceMap = JSON.parse(sourceMapBuffer);
	Object.keys(sourceMap).
		filter(key => !attributes.includes(key)).
		forEach(key => delete sourceMap[key]);
	return JSON.stringify(sourceMap);
};
