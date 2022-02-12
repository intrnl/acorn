let _require;

/**
 * Get Webpack require function
 * @returns {Function}
 */
export function getRequire () {
	if (_require) {
		return _require;
	}

	// frankly i don't think anything will go into conflict here.
	const id = 'wpc';
	const chunkName = 'webpackChunkdiscord_app';

	globalThis[chunkName].push([[id], {}, (_r) => (_require = _r)]);

	delete _require.m[id];
	delete _require.c[id];

	return _require;
}

/**
 * @typedef {(exports: any) => boolean} ModuleFilter
 */

/**
 * Returns a module that matches a given predicate.
 * @param {ModuleFilter} predicate
 * @returns {any}
 */
export function findModule (predicate) {
	const cache = getRequire().c;

	for (const index in cache) {
		const _exports = cache[index].exports;

		if (isPrimitive(_exports)) {
			continue;
		}

		if (predicate(_exports)) {
			return _exports;
		}
		else if (!isPrimitive(_exports.default) && predicate(_exports.default)) {
			return _exports.default;
		}
	}
}

/**
 * Returns an array of modules that match a given predicate.
 * @param {ModuleFilter} predicate
 * @returns {any[]}
 */
export function filterModules (predicate) {
	const cache = getRequire().c;
	const result = [];

	for (const index in cache) {
		const _exports = cache[index].exports;

		if (isPrimitive(_exports)) {
			continue;
		}

		if (predicate(_exports)) {
			result.push(_exports);
		}
		else if (!isPrimitive(_exports.default) && predicate(_exports.default)) {
			result.push(_exports.default);
		}
	}

	return result;
}

/**
 * Creates a filter to find React components exported on default by its given name.
 * @param {string} name
 * @returns {ModuleFilter}
 */
export function byDisplayName (name) {
	return (_exports) => {
		return _exports.displayName === name;
	};
}

/**
 * Creates a filter to find modules that contains given properties.
 * @param {string[]} props
 * @returns {ModuleFilter}
 */
export function byProperties (props) {
	return (_exports) => {
		for (const prop of props) {
			if (!(prop in _exports)) {
				return false;
			}
		}

		return true;
	};
}

/**
 * Creates a filter to find modules that contains given prototype properties.
 * @param {string[]} protos
 * @returns {ModuleFilter}
 */
export function byPrototypes (protos) {
	return (_exports) => {
		const proto = _exports.prototype;

		if (!proto) {
			return false;
		}

		for (const prop of protos) {
			if (!(prop in proto)) {
				return false;
			}
		}

		return true;
	};
}

/**
 * Check if value is primitive, we're not interested on them.
 */
function isPrimitive (value) {
	return typeof value !== 'object' && typeof value !== 'function';
}
