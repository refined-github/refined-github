import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

const createRawUrl = (href: string): string => {
	const url = href.split('/');
	url[3] = 'raw'; // Replaces 'blob'
	return url.join('/');
};

const observer = new MutationObserver(([{addedNodes}]) => {
	for (const node of addedNodes) {
		if (node instanceof Element) {
			if (node.matches('js-diff-progressive-container')) {
				observer.observe(node, {childList: true});
			} else {
				addRawBtn(node);
			}
		}
	}
});

function addRawBtn(node: Element) {
	for (const link of select.all('.file-header .file-actions > div.BtnGroup [href*=\'/blob/\']', node)) {
		link.after(
			<a href={createRawUrl(link.getAttribute('href'))} class="btn btn-sm BtnGroup-item">
				Raw
			</a>
		);
	}
}

function init() {
	addRawBtn(select('.js-diff-progressive-container:first-child'));
	observer.observe(select('.js-diff-progressive-container:last-child'), {childList: true});
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
