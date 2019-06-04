import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import onPrFileLoad from '../libs/on-pr-file-load';

const createRawUrl = (href: string): string => {
	const url = href.split('/');
	url[3] = 'raw'; // Replaces 'blob'
	return url.join('/');
};

function addRawButtons(): void {
	for (const dropdown of select.all<HTMLElement>('.js-file-header-dropdown')) {
		const anchor: HTMLAnchorElement | null = select('[data-ga-click^="View file"]', dropdown);

		// Skip if the link has already been added
		if (!select.exists('.raw-file-link', dropdown) && anchor) {
			anchor.after(
				<a href={createRawUrl(anchor.pathname)} className="pl-5 dropdown-item btn-link raw-file-link" role="menuitem">
          View raw
				</a>
			);
		}
	}
}

function init(): void {
	addRawButtons();
	onPrFileLoad(addRawButtons);
}

features.add({
	id: 'raw-file-link',
	description: 'Link to raw files in pull requests and commits',
	screenshot: 'https://user-images.githubusercontent.com/1402241/56484988-b99f2500-6504-11e9-9748-c944e1070cc8.png',
	include: [
		features.isCommit,
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
