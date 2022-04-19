// todo: barebones semver library for range checking.
// should this be necessary? npm's semver library is pretty heavy.
// this is probably only ever used for plugin dependency checks, it won't be
// used for checking the actual plugin version.

import { assert } from './index.js';


const RE_SEMVER = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Parse semantic version
 * @param {string} version
 */
export const parseVersion = (version) => {
	version = version.trim();

	const match = RE_SEMVER.exec(version);
	assert(match);

	const major = +match.groups.major;
	const minor = +match.groups.minor;
	const patch = +match.groups.patch;

	const prerelease = match.groups.prerelease;
	const buildmetadata = match.groups.buildmetadata;

	assert(major >= 0 && major < MAX_SAFE_INTEGER);
	assert(minor >= 0 && minor < MAX_SAFE_INTEGER);
	assert(patch >= 0 && patch < MAX_SAFE_INTEGER);

	return {
		major,
		minor,
		patch,
		prerelease,
		buildmetadata,
	};
};

/**
 * Parse semantic version range
 * @param {string} range
 */
export const parseRange = (range) => {
	range = range.trim();

	// first, split based on ||
	const parts = range.split(/\s*\|\|\s*/);

	for (const part of parts) {

	}
};

export const satisfiesRange = (version, range) => {

};
