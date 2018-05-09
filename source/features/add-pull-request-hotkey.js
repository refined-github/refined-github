import select from 'select-dom';
import {registerShortcut} from './improve-shortcut-help';

export default function () {
	registerShortcut('pr', 'g 1', 'Go to Conversation');
	registerShortcut('pr', 'g 2', 'Go to Commits');
	registerShortcut('pr', 'g 3', 'Go to Checks');
	registerShortcut('pr', 'g 4', 'Go to Files changed');

	const tabs = select.all('.tabnav-pr .tabnav-tab');
	const selectedIndex = tabs.indexOf(select('.tabnav-pr .selected'));
	const lastTab = tabs.length - 1;

	for (const [index, tab] of tabs.entries()) {
		const keys = [`g ${index + 1}`];
		if (index === selectedIndex - 1 || (selectedIndex === 0 && index === lastTab)) {
			keys.push('g ArrowLeft');
		} else if (index === selectedIndex + 1 || (selectedIndex === lastTab && index === 0)) {
			keys.push('g ArrowRight');
		}
		tab.dataset.hotkey = keys;
	}
}
