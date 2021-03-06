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
export const patch = (obj, prop, middleware, instead) => {
	assert(typeof middleware === 'function', 'middleware must be a function');

	// todo: might have to revisit this down the line, but we're just going to
	// assume that if you're monkeypatching a method that doesn't exist, it means
	// you're adding into it.
	if (obj[prop] == null) {
		obj[prop] = noop;
	}
	else {
		assert(typeof obj[prop] === 'function', 'obj[prop] must be a function');
	}

	if (!obj[prop][_patched]) {
		function runner (...args) {
			const wares = runner[_wares];
			const original = runner[_original];

			let idx = wares.length;

			// -1 is the original function
			const loop = (args) => {
				idx -= 1;

				if (idx < 0) {
					return original.apply(this, args);
				}

				const fn = wares[idx];

				return fn(this, args, loop);
			};

			return loop(args);
		}

		const original = obj[prop];

		runner[_patched] = true;
		runner[_wares] = [];
		runner[_original] = original;
		runner[_offset] = 0;

		runner.toString = () => original.toString();

		obj[prop] = runner;
	}

	const runner = obj[prop];
	let running = true;

	if (instead) {
		// adding middleware to the back will affect currently running monkeypatch
		runner[_wares] = runner[_wares].slice();
		runner[_wares].splice(runner[_offset]++, 0, middleware);
	}
	else {
		runner[_wares].push(middleware);
	}


	return () => {
		if (!running) {
			return;
		}

		running = false;

		// we avoid mutating the array in the case that the monkeypatch is still
		// running.
		runner[_wares] = filterUniq(runner[_wares], middleware);

		if (instead) {
			runner[_offset]--;
		}

		// revert monkeypatch if no wares are left.
		if (runner[_wares].length < 1) {
			obj[prop] = runner[_original];
		}
	};
};

// comparing to Array#filter equivalent: (Firefox Nightly 99 2022-02-14)
// https://esbench.com/bench/620689336c89f600a5701610
// 247% faster on 50 items    (1,663,884 vs. 5,783,073)
// 165% faster on 500 items   (  109,167 vs. 289,485  )
// 200% faster on 5000 items  (   11,623 vs. 34,950   )
const filterUniq = (array, value) => {
	const idx = array.indexOf(value);
	array = array.slice();
	array.splice(idx, 1);

	return array;
};

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
