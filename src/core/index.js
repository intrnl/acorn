import * as api from './api/index.js';
import { patchSettings } from './settings/index.jsx';

globalThis.acorn = api;

const initialize = async () => {
	patchSettings();
};

initialize();
