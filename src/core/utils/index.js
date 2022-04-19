export const assert = (condition, message) => {
	if (!condition) {
		throw new Error(message || 'Assertion failed');
	}
};

export const createDeferred = () => {
	const deferred = {};

	deferred.promise = new Promise((resolve, reject) => (
		Object.assign(deferred, { resolve, reject })
	));

	return deferred;
};
