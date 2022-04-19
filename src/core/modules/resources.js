import { createStreamIterator } from '../utils/streams.js';


const RE_META = /\B\/\*[*!]\s*(?:\n|\r|\r\n)([\S\s]*?)(?:\n|\r|\r\n)\s*\*\*\//;
const RE_META_PART = /\* @([a-zA-Z]+)\s+(.+?)\s*$/gm;

export const readMeta = (source) => {
	// this is a very rudimentary JSDoc-like parser, beware!
	const match = RE_META.exec(source);

	if (!match) {
		return null;
	}

	const content = match[1];

	const meta = Object.create(null);

	for (const matched of content.matchAll(RE_META_PART)) {
		// turn into array if key is defined more than once.
		let [, key, value] = matched;

		if (key in meta) {
			if (typeof meta[key] === 'string') {
				meta[key] = [meta[key]];
			}

			meta[key].push(value);
		}
		else {
			meta[key] = value;
		}
	}

	return meta;
};

const matchEndMarker = (char, pos) => {
	// match `**/`
	return (
		(pos === 0 && char === '*') ||
		(pos === 1 && char === '*') ||
		(pos === 2 && char === '/')
	);
};

export const fetchResourceIfMismatch = async (url, version) => {
	// we attempt to fetch the first 1024 bytes of the resource to find the
	// metadata containing the version, if the version mismatches or the metadata
	// doesn't contain the version, then we continue to fetch.

	// if the metadata doesn't contain the version, we'll just check if the
	// source matches with our cache, which is done outside.

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Response error ${response.status}`);
	}

	const stream = response.body.pipeThrough(new TextDecoderStream());
	const iterator = createStreamIterator(stream);

	let source = '';
	let pos = 0;
	let meta = null;
	let skip = false;

	for await (const chunk of iterator) {
		// increment pos on char match, reset if mismatch.
		if (!skip) {
			for (const char of chunk) {
				if (matchEndMarker(char, pos)) {
					pos++;
				}
				else {
					pos = 0;
				}
			}

			if (pos === 3) {
				meta = readMeta(source);
				skip = true;

				if (meta?.version && meta.version === version) {
					return null;
				}
			}
		}

		source += chunk;

		// we still haven't found the meta, so we'll stop trying to find it.
		if (!skip && source.length >= 1024) {
			skip = true
		}
	}

	return { source, meta };
};

export const fetchResource = async (url) => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Response error ${response.status}`);
	}

	const source = await response.text();
	const meta = readMeta(source);

	return { source, meta };
};
