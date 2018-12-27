let { loadExtension } = require("./util");

exports.static = function(config, webroot) {
	let donny = loadExtension("donny",
			"you need to install donny to use --serve");
	let [bind, port] = parse(config);

	donny({
		port,
		bind,
		webroot
	}).then(() => {
		console.error(`Serving '${webroot}' on port ${port}`);
	});
};

exports.live = function(config, root) {
	let liveServer = loadExtension("live-server",
			"you need to install live-server to use --liveserve");
	let [host, port] = parse(config);

	liveServer.start({
		port,
		host,
		root,
		open: false
	});
};

let format = /([\d.]+:)?(\d+)/;
function parse(config) {
	// eslint-disable-next-line no-unused-vars
	let [_, host, port] = format.exec(config);
	host = host || "0.0.0.0:";

	return [
		host.slice(0, -1),
		port
	];
}
