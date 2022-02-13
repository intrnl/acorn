// monkeypatch system works like middlewares, patches can call next() to pass
// control to the next patch, before eventually reaching the original function.

/**
 * @typedef {(args: any[]) => any} NextMiddleware
 */

/**
 * @typedef {(thisArgument: any, args: any[], next: NextMiddleware) => any} Middleware
 */

import { assert } from '../utils/index.js';


const _patched = '_patched';
const _wares = '_wares';
const _original = '_original';
const _offset = '_offset';

const noop = () => {};

/**
 * Does a monkeypatch
 * @param {object} obj Object to patch
 * @param {string} prop Property key to patch
 * @param {Middleware} middleware Middleware to run
 * @param {boolean} [instead] Add middleware to the back where it'll be run last,
 * this should be used to replace the original method.
 */
export function patch (obj, prop, middleware, instead) {
	assert(typeof middleware === 'function');

	// todo: might have to revisit this down the line, but we're just going to
	// assume that if you're monkeypatching a method that doesn't exist, it means
	// you're adding into it.
	if (!obj[prop]) {
		obj[prop] = noop;
	}

	if (!obj[prop][_patched]) {
		function runner (...args) {
			const wares = runner[_wares];
			const original = runner[_original];

			let idx = wares.length;

			// -1 is the original function
			const loop = (args) => {
				const fn = wares[idx -= 1];

				if (idx < 0) {
					return original.apply(this, args);
				}

				return fn(this, args, loop);
			};

			return loop(args);
		}

		const original = obj[prop];

		runner[_patched] = true;
		runner[_wares] = [];
		runner[_original] = original;
		runner[_offset] = 0;

		obj[prop] = runner;
	}

	let running = true;

	if (instead) {
		// adding middleware to the back will affect currently running monkeypatch
		obj[prop][_wares] = obj[prop][_wares].slice();
		obj[prop][_wares].splice(obj[prop][_offset]++, 0, middleware);
	}
	else {
		obj[prop][_wares].push(middleware);
	}


	return () => {
		if (!running) {
			return;
		}

		running = false;

		// we avoid mutating the array in the case that the monkeypatch is still
		// running.
		obj[prop][_wares] = filterUniq(obj[prop][_wares], middleware);

		if (instead) {
			obj[prop][_offset]--;
		}

		// revert monkeypatch if there's only one ware left, it should still be the
		// original function, i hope.
		if (obj[prop][_wares].length <= 1) {
			obj[prop] = obj[prop][_original];
		}
	};
}

// comparing to Array#filter equivalent:
// https://esbench.com/bench/620689336c89f600a5701610
// 32% faster on 50 items
// 157% faster on 500 items
// 180% faster on 5000 items
function filterUniq (array, value) {
	const idx = array.indexOf(value);
	array = array.slice();
	array.splice(idx, 1);

	return array;
}

export class PatchContainer {
	patches = [];

	patch (obj, prop, fn) {
		const ret = patch(obj, prop, fn);
		this.patches.push(ret);

		return ret;
	}

	unpatchAll () {
		for (let unpatch of this.patches) {
			unpatch();
		}

		this.patches.length = 0;
	}
}
