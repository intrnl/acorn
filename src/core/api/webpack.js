const listeners = new Set();
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

	const wpc = globalThis[chunkName];
	wpc.push([[id], {}, (_r) => (_require = _r)]);

	delete _require.m[id];
	delete _require.c[id];

	// monkeypatch push function to add listeners.
	const _push = wpc.push;
	wpc.push = function (chunk) {
		const modules = chunk[1];

		for (const id in modules) {
			const definition = modules[id];

			const runner = (_module, _exports, _require) => {
				definition.call(undefined, _module, _exports, _require);

				// we've served our purpose here.
				modules[id] = definition;

				if (!listeners.size || isPrimitive(_exports)) {
					return;
				}

				for (const listener of listeners) {
					listener(_exports);
				}
			};

			runner.toString = () => definition.toString();
			modules[id] = runner;
		}

		return _push.call(this, chunk);
	};

	return _require;
}

/**
 * @typedef {(exports: any) => boolean} ModuleFilter
 */

/**
 * Adds a listener for new module additions
 * @param {ModuleFilter} listener
 */
export function addListener (listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

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

export function findModuleAsync (predicate) {
	const mod = findModule(predicate);

	if (mod) {
		return Promise.resolve(mod);
	}

	return new Promise((resolve) => {
		const unlisten = addListener((_exports) => {
			if (predicate(_exports)) {
				unlisten();
				resolve(_exports);
			}
			else if (!isPrimitive(_exports.default) && predicate(_exports.default)) {
				unlisten();
				resolve(_exports.default);
			}
		});
	});
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
