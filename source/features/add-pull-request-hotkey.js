import select from 'select-dom';

export default function () {
	const tabs = select.all('.tabnav-pr .tabnav-tab');
	const selectedIndex = tabs.indexOf(select('.tabnav-pr .selected'));

	for (const [index, tab] of tabs.entries()) {
		const keys = [`p ${index + 1}`];
		if (index === selectedIndex - 1) {
			keys.push('p ArrowLeft');
		} else if (index === selectedIndex + 1) {
			keys.push('p ArrowRight');
		}
		tab.setAttribute('data-hotkey', keys);
	}
}
