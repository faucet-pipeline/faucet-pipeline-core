import path from "path";

export async function readConfig(rootDir, filepath = "faucet.config.js") {
	let configPath = path.resolve(rootDir, filepath);
	return {
		referenceDir: path.dirname(configPath),
		config: await import(configPath)
	};
}
