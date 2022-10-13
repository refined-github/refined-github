import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import GitHubURL from '../github-helpers/github-url';

function handleMenuOpening({delegateTarget: dropdown}: DelegateEvent): void {
	dropdown.classList.add('rgh-more-file-links'); // Mark this as processed

	const viewFile = select('a[data-ga-click^="View file"]', dropdown)!;
	const getDropdownLink = (name: string, route: string): JSX.Element => {
		const {href} = new GitHubURL(viewFile.href).assign({route});
		return (
			<a href={href} className="pl-5 dropdown-item btn-link" role="menuitem">
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

function init(signal: AbortSignal): void {
	// `capture: true` required to be fired before GitHub's handlers
	delegate(document, '.file-header .js-file-header-dropdown:not(.rgh-more-file-links)', 'toggle', handleMenuOpening, {capture: true, signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasFiles,
	],
	init,
});
