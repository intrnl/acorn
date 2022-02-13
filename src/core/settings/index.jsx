import * as api from '../api/index.js';


const sections = [
	{ section: 'DIVIDER' },
	{ section: 'HEADER', label: 'Acorn' },
];

export function patchSettings () {
	// @jsx h
	const React = api.libraries.React;
	const h = React.createElement;

	const SettingsView = api.components.SettingsView;
	const Text = api.components.Text;

	const classes = api.webpack.findModule(api.webpack.byProperties(['versionHash', 'info']));

	// contains arrays we've already mutated, or found not to be the User Settings view.
	const tainted = new WeakSet();

	api.patcher.patch(SettingsView.prototype, 'componentDidMount', (_this, args, next) => {
		const items = _this.props.sections;

		if (tainted.has(items)) {
			return next(args);
		}

		const index = items.findIndex((item) => item.section === 'changelog');

		if (index === -1) {
			tainted.add(items);
			return next(args);
		}

		items.splice(index - 1, 0, ...sections);
		items.push({ section: 'CUSTOM', element: ModDebugInfo });

		tainted.add(items);

		_this.forceUpdate();

		return next(args);
	});

	function ModDebugInfo () {
		return (
			<div className={`${classes.info} ${classes.versionHash}`}>
				<Text size={Text.Sizes.SIZE_12} color={Text.Colors.MUTED}>
					Acorn
				</Text>
			</div>
		);
	}
}
