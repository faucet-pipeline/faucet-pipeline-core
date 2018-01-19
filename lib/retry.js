// Retries a function that returns a promise
// The first argument is the function
// The second argument is an array of ms to wait in between attempts
// Returns a function that takes the same arguments as the provided function
function retry(fn, retries) {
	return (...params) => fn(...params).catch(err => {
		if(retries.length === 0) {
			throw err;
		}
		let backoff = retries.shift();
		return wait(backoff).then(_ => retry(fn, retries)(...params));
	});
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = retry;
