import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

const childList = { childList: true };

const createRawUrl = (href: string): string => {
	let url = href.split('/');
	url[3] = 'raw'; // Replaces 'blob'
	return url.join('/');
}

const observer = new MutationObserver(([{ addedNodes }]) => {
	for (const node of addedNodes) {
		const element = node as Element;
		if (element.tagName === 'DIV') {
			if (element.className === 'js-diff-progressive-container') {
				observer.observe(element, childList)
			} else {
				addRawBtn(element);
			}
		}
	}
})

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
	observer.observe(select('.js-diff-progressive-container:last-child'), childList);
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
