import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function handleMenuOpening(event: DelegateEvent): void {
	const dropdown = event.delegateTarget.nextElementSibling!;

	// Only if it's not already there
	if (select.exists('.rgh-raw-file-link', dropdown)) {
		return;
	}

	const viewFile = select<HTMLAnchorElement>('[data-ga-click^="View file"]', dropdown)!;
	const url = viewFile.pathname.split('/');
	url[3] = 'raw'; // Replaces 'blob'

	viewFile.after(
		<a href={url.join('/')} className="pl-5 dropdown-item btn-link rgh-raw-file-link" role="menuitem">
			View raw
		</a>
	);
}

function init(): void {
	delegate('.js-file-header-dropdown > summary', 'click', handleMenuOpening);
}

features.add({
	id: __featureName__,
	description: 'Adds link to view the raw version of files in PRs and commits.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/56484988-b99f2500-6504-11e9-9748-c944e1070cc8.png',
	include: [
		features.isCommit,
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
