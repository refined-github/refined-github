import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

const createRawUrl = (href: string): string => {
	const url = href.split('/');
	url[3] = 'raw'; // Replaces 'blob'
	return url.join('/');
};

function addRawButtons() {
	for (const anchor of select.all<HTMLAnchorElement>('.file-header .file-actions > div.BtnGroup [href*=\'/blob/\']:last-child')) {
		anchor.after(
			<a href={createRawUrl(anchor.pathname)} className="btn btn-sm BtnGroup-item">
				Raw
			</a>
		);
	}
}

function init() {
	addRawButtons();

	// Some files are loaded progressively later. On load, look for more buttons and more fragments
	for (const fragment of select.all('include-fragment.diff-progressive-loader')) {
		fragment.addEventListener('load', init);
	}
}

features.add({
	id: 'raw-view-link',
	include: [
		features.isCommit,
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
