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

function addRawBtn(node: Element | null) {
	if (node) {
		for (const link of select.all('.file-header .file-actions > div.BtnGroup [href*=\'/blob/\']', node)) {
			const href = link.getAttribute('href');
			if (href) {
				link.after(
					<a href={createRawUrl(href)} className="btn btn-sm BtnGroup-item">
						Raw
					</a>
				);
			}
		}
	}
}

function init() {
	addRawBtn(select('.js-diff-progressive-container:first-child'));
	const lastProgressiveContainer = select('.js-diff-progressive-container:last-child');
	if (lastProgressiveContainer) {
		observer.observe(lastProgressiveContainer, {childList: true});
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
