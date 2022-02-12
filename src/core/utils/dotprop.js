function getPathSegments (path) {
	const parts = path.split('.');
	const segments = [];

	for (let idx = 0; idx < parts.length; idx++) {
		let part = parts[idx];

		// collapse parts if we encounter `foo\\.bar`
		while (part[part.length - 1] === '\\' && parts[idx + 1] !== undefined) {
			part = part.slice(0, -1) + '.' + parts[++idx];
		}

		segments.push(part);
	}

	return segments;
}

export function getProperty (object, path, defaultValue) {
	const segments = getPathSegments(path);

	for (let idx = 0; idx < segments.length; idx++) {
		const segment = segments[idx];

		object = object[segment];

		if (object == null) {
			return defaultValue;
		}
	}

	return object;
}

export function setProperty (object, path, value) {
	const segments = getPathSegments(path);

	for (let idx = 0; idx < segments.length; idx++) {
		const segment = segments[idx];

		if (typeof object[segment] !== 'object') {
			object[segment] = {};
		}

		if (idx === segments.length - 1) {
			return object[segment] = value;
		}

		object = object[segment];
	}
}

export function hasProperty (object, path) {
	const segments = getPathSegments(path);

	for (let idx = 0; idx < segments.length; idx++) {
		const segment = segments[idx];

		if (!(segment in object)) {
			return false;
		}

		object = object[segment];

		if (typeof object !== 'object') {
			return false;
		}
	}

	return true;
}
