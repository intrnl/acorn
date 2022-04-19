import { findModule, byProperties, byDisplayName } from './webpack.js';


let _Libraries_React;
let _Libraries_ReactDOM;
let _Libraries_ReactRouter;

let _Modules_Flux;
let _Modules_FluxDispatcher;

let _Components_Flex;
let _Components_Text;
let _Components_Button;
let _Components_DropdownButton;
let _Components_Menu;
let _Components_SettingsView;

export const libraries = {
	get React () {
		return _Libraries_React ||= findModule(byProperties(['cloneElement', 'createElement']));
	},
	get ReactDOM () {
		return _Libraries_ReactDOM ||= findModule(byProperties(['findDOMNode', 'render']));
	},
	get ReactRouter () {
		return _Libraries_ReactRouter ||= findModule(byProperties(['BrowserRouter', 'Router']));
	},
};

export const modules = {
	get Flux () {
		return _Modules_Flux ||= findModule(byProperties(['Store', 'connectStores']));
	},
	get FluxDispatcher () {
		return _Modules_FluxDispatcher ||= findModule(byProperties(['_currentDispatchActionType', '_processingWaitQueue']));
	},
};

export const components = {
	get Flex () {
		return _Components_Flex ||= findModule(byDisplayName('Flex'));
	},
	get Text () {
		return _Components_Text ||= findModule(byDisplayName('Text'));
	},
	get Button () {
		return _Components_Button ||= findModule(byProperties(['BorderColors', 'Colors']));
	},
	get DropdownButton () {
		return _Components_DropdownButton ||= findModule(byProperties(['DropdownSizes', 'Colors']));
	},
	get Menu () {
		if (_Components_Menu) {
			return _Components_Menu;
		}

		const mod = findModule(byProperties(['MenuItem', 'default']));
		const Menu = mod.default;

		for (const prop in mod) {
			Menu[prop] = mod[prop];
		}

		return _Components_Menu = Menu;
	},
	get SettingsView () {
		return _Components_SettingsView ||= findModule(byDisplayName('SettingsView'));
	},
};
