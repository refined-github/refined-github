import select from 'select-dom';
import { registerShortcut } from './improve-shortcut-help';

export default function () {
	registerShortcut("pr", "q 1", "Go to Conversation");
	registerShortcut("pr", "q 2", "Go to Commits");
	registerShortcut("pr", "q 3", "Go to Files changed");

	const tabs = select.all('.tabnav-pr .tabnav-tab');
	const selectedIndex = tabs.indexOf(select('.tabnav-pr .selected'));
	const lastTab = tabs.length - 1;

	for (const [index, tab] of tabs.entries()) {
		const keys = [`q ${index + 1}`];
		if (index === selectedIndex - 1 || (selectedIndex === 0 && index === lastTab)) {
			keys.push('q ArrowLeft');
		} else if (index === selectedIndex + 1 || (selectedIndex === lastTab && index === 0)) {
			keys.push('q ArrowRight');
		}
		tab.dataset.hotkey = keys;
	}
}
