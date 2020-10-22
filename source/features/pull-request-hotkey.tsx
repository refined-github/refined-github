import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const tabs = select.all([
		'.tabnav-pr .tabnav-tab', // Pre "Repository refresh" layout
		'.tabnav-tabs .tabnav-tab'
	]);
	const selectedIndex = tabs.indexOf(select([
		'.tabnav-pr .selected', // Pre "Repository refresh" layout
		'.tabnav-tabs .selected'
	])!);
	const lastTab = tabs.length - 1;

	for (const [index, tab] of tabs.entries()) {
		const keys = [`g ${index + 1}`];
		if (index === selectedIndex - 1 || (selectedIndex === 0 && index === lastTab)) {
			keys.push('g ArrowLeft');
		} else if (index === selectedIndex + 1 || (selectedIndex === lastTab && index === 0)) {
			keys.push('g ArrowRight');
		}

		tab.dataset.hotkey = String(keys);
	}
}

void features.add(__filebasename, {
	shortcuts: {
		'g 1': 'Go to Conversation',
		'g 2': 'Go to Commits',
		'g 3': 'Go to Checks',
		'g 4': 'Go to Files changed'
	},
	include: [
		pageDetect.isPR
	],
	init
});
