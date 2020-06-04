import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

function handleMenuOpening(event: delegate.Event): void {
	event.delegateTarget.classList.add('rgh-raw-file-link'); // Mark this as processed
	const dropdown = event.delegateTarget.nextElementSibling!;

	const viewFile = select<HTMLAnchorElement>('[data-ga-click^="View file"]', dropdown)!;
	const href = new GitHubURL(viewFile.href).assign(
		{route: 'raw'}
	).toString();

	viewFile.after(
		<a href={href} className="pl-5 dropdown-item btn-link rgh-raw-file-link" role="menuitem">
			View raw
		</a>
	);
}

function init(): void {
	delegate(document, '.js-file-header-dropdown > summary:not(.rgh-raw-file-link)', 'click', handleMenuOpening);
}

void features.add({
	id: __filebasename,
	description: 'Adds link to view the raw version of files in PRs and commits.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/56484988-b99f2500-6504-11e9-9748-c944e1070cc8.png'
}, {
	include: [
		pageDetect.isCommit,
		pageDetect.isPRFiles,
		pageDetect.isCompare
	],
	init
});
