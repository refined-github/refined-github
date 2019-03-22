import select from 'select-dom';
import React from 'dom-chef';
import features from '../libs/features';
import getTextNodes from '../libs/get-text-nodes';

const splittingRegex = /`(.*?)`/g;

function splitTextReducer(frag, text, index) {
	if (index % 2 && text.length >= 1) {
		// Code is always in odd positions
		frag.append(<code>{text}</code>);
	} else if (text.length > 0) {
		frag.append(text);
	}

	return frag;
}

function init() {
	for (const title of select.all('.issues-listing .js-navigation-open')) {
		for (const node of getTextNodes(title)) {
			const frag = node.textContent
				.split(splittingRegex)
				.reduce(splitTextReducer, new DocumentFragment());

			if (frag.children.length > 0) {
				node.replaceWith(frag);
			}
		}
	}
}

features.add({
	id: 'parse-backticks',
	include: [
		features.isIssueList
	],
	load: features.onAjaxedPages,
	init
});
