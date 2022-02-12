import { getProperty, hasProperty, setProperty } from '../utils/dotprop.js';


// todo: have a way to load and save this to somewhere.
const storage = {};

class Configuration {
	/** @type {string} */
	#scope;

	constructor (scope) {
		this.#scope = scope ? `${scope}.` : '';
	}

	has (path) {
		return hasProperty(storage, this.#scope + path);
	}

	get (path, defaultValue) {
		return getProperty(storage, this.#scope + path, defaultValue);
	}

	set (path, value) {
		const ret = setProperty(storage, this.#scope + path, value);

		// todo: notify storage mutation

		return ret;
	}
}

export function retrieve (scope) {
	return new Configuration(scope);
}
