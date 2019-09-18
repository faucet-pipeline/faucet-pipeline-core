let { loadExtension, repr } = require("./util");

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
	let i = config.lastIndexOf(":");
	if(i === -1) { // port only
		return ["0.0.0.0", config];
	}

	let host = config.substr(0, i);
	let port = config.substr(i + 1);
	return [host, port];
}
