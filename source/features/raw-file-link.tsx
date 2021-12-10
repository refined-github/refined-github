import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

function handleMenuOpening({delegateTarget: dropdown}: delegate.Event): void {
	dropdown.classList.add('rgh-raw-file-link'); // Mark this as processed

	const viewFile = select('a[data-ga-click^="View file"]', dropdown)!;
	const {href} = new GitHubURL(viewFile.href).assign({route: 'raw'});

	viewFile.after(
		<a data-skip-pjax href={href} className="pl-5 dropdown-item btn-link" role="menuitem">
			View raw
		</a>,
	);
}

function init(): void {
	// `useCapture` required to be fired before GitHub's handlers
	delegate(document, '.file-header .js-file-header-dropdown:not(.rgh-raw-file-link)', 'toggle', handleMenuOpening, true);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommit,
		pageDetect.isPRFiles,
		pageDetect.isCompare,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
