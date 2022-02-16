// this is where plugins are being managed.
//
// here are details on how plugins work:
// - they are limited to a single file.
// - they have a metadata on the top of the file that is JSDoc-like.
// - they run in a minimal CommonJS-like environment with `exports` and `require` provided.
// - they expose `activate` and optionally `deactivate` methods.
// - they can expose APIs to other plugins by returning an object from the `activate` method.
//
// - the `activate` method will be called with PluginContext.
//
// - there is no hot reloading of plugins, there are potential memory leaks that
//   can happen from plugins not cleaning up properly and causing stale references.

/**
 * @typedef {object} Plugin Represents a plugin.
 * @property {string} id Plugin identifier in the form of `authorName.pluginName`.
 * @property {boolean} active Whether the plugin is active.
 * @property {object} manifest Plugin manifest.
 * @property {any} exports Public API exposed by the plugin.
 */

/**
 * @typedef {object} PluginContext A collection of utilities private to a plugin.
 * @property {Function[]} disposables An array to which disposables can be added. They will be
 * called when the plugin is deactivated.
 */

import * as api from '../api/index.js';
import { createDeferred } from '../utils/index.js';


export const plugins = Object.create(null);
const internals = Object.create(null);

function _require (from, to) {
	if (from === to) {
		return;
	}

	switch (to) {
		case 'acorn': return api;
		case 'acorn/components': return api.components;
		case 'acorn/libraries': return api.libraries;
		case 'acorn/modules': return api.modules;
		case 'acorn/patcher': return api.patcher;
		case 'acorn/react': return api.react;
		case 'acorn/storage': return api.storage;
		case 'acorn/webpack': return api.webpack;
	}

	throw new Error(`unable to require ${to}`);
}

function createModuleWrapper (source, url) {
	const code = (
		`(function(exports,require){${source}})` +
		`\n//# sourceURL=${url}`
	);

	return (0, eval)(code);
}

function validateGraph (graph) {
	const cyclic = [];
	const resolved = [];

	function resolve (node, seen) {
		seen.push(node);

		const dependencies = graph.get(node);

		for (const edge of dependencies) {
			if (resolved.includes(edge)) {
				continue;
			}

			if (seen.includes(edge)) {
				// we've hit a circular dependency, now only show the relevant part
				const index = seen.indexOf(edge);

				const cycle = seen.slice(index);
				cycle.push(edge);

				cyclic.push(cycle);
				continue;
			}

			resolve(edge, seen.slice());
		}

		resolved.push(node);
	}

	for (const node of graph.keys()) {
		if (resolved.includes(node)) {
			continue;
		}

		resolve(node, []);
	}

	if (cyclic.length) {
		throw {
			name: 'CyclicError',
			message: 'Circular dependencies detected',
			cyclic,
		};
	}
}

function runGraph (vertices) {
	const graph = new Map(vertices);
	validateGraph(vertices);

	const resolvers = new Map();
	const promises = [];

	for (const fn of graph.keys()) {
		const deferred = createDeferred();

		resolvers.set(fn, deferred);
		promises.push(deferred.promise);
	}

	for (const [fn, dependencies] of graph.entries()) {
		Promise.all(dependencies.map((dep) => resolvers.get(dep).promise))
			.then(() => resolvers.get(fn).resolve(fn()))
			.catch(resolvers.get(fn).reject);
	}

	return Promise.allSettled(promises);
}

export {};
