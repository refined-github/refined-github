import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

async function init(): Promise<void | false> {
	await elementReady('.js-check-all-container > :nth-child(2)'); // Wait for filters to be ready
	const forms = select.all('[action="/notifications/beta/update_view_preference"]');
	if (forms.length === 0) {
		return false;
	}

	if (forms.length > 2) {
		throw new Error('GitHub added new view types. This feature is obsolete.');
	}

	const dropdown = forms[0].closest('details')!;
	const currentView = select('summary i', dropdown)!.nextSibling!.textContent!.trim();
	const desiredForm = forms[Number(currentView === 'Repository')]; // `false` -> 0 -> "Repository"; `true` -> 1 -> "Date"

	// Replace dropdown while keeping its sizing/positioning classes
	dropdown.replaceWith(desiredForm);
	desiredForm.classList.add(...dropdown.classList);
	desiredForm.classList.remove('dropdown', 'details-reset', 'details-overlay');

	const switchButton = select('[type="submit"]', desiredForm)!;
	switchButton.className = 'btn';
	switchButton.textContent = `Group by ${switchButton.textContent!.toLowerCase()}`;
}

features.add({
	id: __filebasename,
	description: 'Makes some dropdowns 1-click instead of unnecessarily 2-click.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/80859624-9bfdb300-8c62-11ea-837f-7b7a28e6fdfc.png'
}, {
	include: [
		pageDetect.isNotifications
	],
	waitForDomReady: false,
	init
});
