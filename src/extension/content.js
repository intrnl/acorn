// todo: have a way to point this to release URL later on.
const CORE_URL = 'http://localhost:1234/core.js';
const STREAMS_POLYFILL_URL = 'https://unpkg.com/web-streams-polyfill/dist/polyfill.es2018.min.js';

const inject = async (CORE_URL, STREAMS_POLYFILL_URL) => {
	// Firefox doesn't support TransformStream yet.
	if (
		typeof TransformStream === 'undefined' ||
		typeof TextDecoderStream === 'undefined'
	) {
		console.log('%c[acorn:prehook]', 'color: #7289da', `injecting streams polyfill`);

		const script = document.createElement('script');
		script.src = STREAMS_POLYFILL_URL;
		document.head.appendChild(script);

		await new Promise((resolve, reject) => {
			script.onload = resolve;
			script.onerror = reject;
		});
	}

	console.log('%c[acorn:prehook]', 'color: #7289da', `injecting core`);

	const script = document.createElement('script');
	script.src = CORE_URL;
	script.type = 'module';
	document.body.appendChild(script);
};

const injection = `(${inject.toString()})('${CORE_URL}', '${STREAMS_POLYFILL_URL}')`;

const script = document.createElement('script');
script.textContent = injection;

document.body.appendChild(script);
setInterval(() => script.remove());
