/**
 * Create an async iterable for a readable stream
 * @template T
 * @param {ReadableStream<T>} stream
 * @returns {AsyncIterableIterator<T>}
 */
export function createStreamIterator (stream) {
	// return if browser already supports async iterator in stream
	if (stream[Symbol.asyncIterator]) {
		return stream;
	}

	const reader = stream.getReader();

	return {
		[Symbol.asyncIterator] () {
			return this;
		},
		next () {
			return reader.read();
		},
		return () {
			reader.releaseLock();
			return {};
		},
	};
}
