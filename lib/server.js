let { loadExtension, repr } = require("./util");

let CONFIG_FORMAT = /([\d.]+:)?(\d+)/;

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
	// eslint-disable-next-line no-unused-vars
	let [_, host, port] = CONFIG_FORMAT.exec(config);
	host = host ? host.slice(0, -1) : "0.0.0.0";
	return [host, port];
}
