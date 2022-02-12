import * as api from './api/index.js';
import { patchSettings } from './settings/index.js';

globalThis.acorn = api;

async function initialize () {
	console.debug('[acorn]', 'waiting');
	while (!api.components.SettingsView) {
		await sleep(500);
	}

	console.debug('[acorn]', 'patching into settings');
	patchSettings();
}

function sleep (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

initialize();
