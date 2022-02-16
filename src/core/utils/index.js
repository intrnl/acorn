export function assert (condition, message) {
	if (!condition) {
		throw new Error(message || 'Assertion failed');
	}
}

export function createDeferred () {
	const deferred = {};

	deferred.promise = new Promise((resolve, reject) => (
		Object.assign(deferred, { resolve, reject })
	));

	return deferred;
}
