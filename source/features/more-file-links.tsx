import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

function handleMenuOpening({delegateTarget: dropdown}: delegate.Event): void {
	dropdown.classList.add('rgh-more-file-links'); // Mark this as processed

	const viewFile = select('a[data-ga-click^="View file"]', dropdown)!;
	const getDropdownLink = (name: string, route: string): JSX.Element => {
		const {href} = new GitHubURL(viewFile.href).assign({route});

		return (
			<a data-skip-pjax href={href} className="pl-5 dropdown-item btn-link" role="menuitem">
				View {name}
			</a>
		);
	};

	viewFile.after(
		getDropdownLink('raw', 'raw'),
		getDropdownLink('blame', 'blame'),
		getDropdownLink('history', 'commits'),
		<div className="dropdown-divider" role="none"/>,
	);
}

function init(): void {
	// `useCapture` required to be fired before GitHub's handlers
	delegate(document, '.file-header .js-file-header-dropdown:not(.rgh-more-file-links)', 'toggle', handleMenuOpening, true);
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
