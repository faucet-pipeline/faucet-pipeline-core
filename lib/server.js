let { loadExtension, repr } = require("./util");

let defaultHost = "0.0.0.0";
let defaultPort = "3000";

exports.static = function(config, webroot) {
	let donny = loadExtension("donny", "failed to activate server");
	let [host, port] = parse(config);

	donny({ port, bind: host, webroot }).
		then(() => {
			console.error(`serving ${repr(webroot)} at http://${host}:${port}`);
		});
};

exports.live = function(config, root) {
	let liveServer = loadExtension("live-server", "failed to activate live-server");
	let [host, port] = parse(config);

	liveServer.start({ port, host, root, open: false });
};

function parse(config) {
	let host = defaultHost;
	let port = defaultPort;

	if(typeof config === "number") {
		port = config;
	} else if(typeof config === "string") {
		let i = config.lastIndexOf(":");
		if(i > -1) {
			host = config.substr(0, i);
			port = config.substr(i + 1);
		}
	}

	return [host, port];
}
