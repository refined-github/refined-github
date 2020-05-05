import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	const tabs = select.all('.tabnav-pr .tabnav-tab');
	const selectedIndex = tabs.indexOf(select('.tabnav-pr .selected')!);
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

features.add({
	id: __filebasename,
	description: 'Adds keyboard shortcuts to cycle through PR tabs: `g` `←` and `g` `→`, or `g` `1`, `g` `2`, `g` `3` and `g` `4`',
	screenshot: false,
	shortcuts: {
		'g 1': 'Go to Conversation',
		'g 2': 'Go to Commits',
		'g 3': 'Go to Checks',
		'g 4': 'Go to Files changed'
	}
}, {
	include: [
		pageDetect.isPR
	],
	init
});
