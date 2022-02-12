// utilities for working with React's internals.

const Provider = Symbol.for('react.provider');
const Context = Symbol.for('react.context');
const Memo = Symbol.for('react.memo');
const Suspense = Symbol.for('react.suspense');

/**
 * Retrieve internal React Fiber instance
 * @param {Node} node
 * @returns {any}
 */
export function getReactInstance (node) {
	let instance = node.__reactFiber$;

	if (instance) {
		return instance;
	}

	instance = node.__reactInternalInstance$;

	if (instance) {
		return instance;
	}

	// i don't think we'll ever reach this scenario, but other client mods seems
	// to be doing it.

	for (let key in node) {
		if (
			key.startsWith('__reactFiber') ||
			key.startsWith('__reactInternalInstance')
		) {
			return node[key];
		}
	}
}


/**
 * Retrieve the component used in the Fiber instance, this excludes React's
 * built-in components.
 */
export function getComponent (instance) {
	const type = instance.type;

	if (!type || typeof type === 'string' || type === Suspense) {
		return;
	}

	const $$typeof = type.$$typeof;

	if ($$typeof === Provider || $$typeof === Context) {
		return;
	}

	if ($$typeof === Memo) {
		return type.type;
	}

	return type;
}

/**
 * Retrieve the states of a class component-backed Fiber instance.
 */
export function getClassComponentState (instance) {
	const state = instance.stateNode;

	if (state instanceof Node) {
		return;
	}

	return state;
}

/**
 * Retrieve the states of a functional component-backed Fiber instance, as they
 * are in a linked list, this will return the first state. Access the `next`
 * property to get the next state and so on.
 */
export function getHookComponentState (instance) {
	const state = instance.memoizedState;

	return state;
}

/**
 * Retrieve the ancestors of the Fiber instance
 */
export function getAncestors (instance, depth = Infinity) {
	const ancestors = [];
	let curr = instance;

	while (depth > 0 && curr && curr.return) {
		// todo: should current instance be included here?
		curr = curr.return;

		const type = curr.type;

		if (!type || typeof type === 'string' || type === Suspense) {
			continue;
		}

		const $$typeof = type.$$typeof;

		if ($$typeof === Provider || $$typeof === Context) {
			continue;
		}

		ancestors.push(curr);

		depth--;
	}

	return ancestors;
}
