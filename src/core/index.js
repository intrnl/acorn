import * as api from './api/index.js';
import { patchSettings } from './settings/index.jsx';

globalThis.acorn = api;

async function initialize () {
	patchSettings();
}

initialize();
