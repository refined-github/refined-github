/*
`code in backticks` that appears in issue titles and commit titles will be parsed as Markdown
https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png
*/
import select from 'select-dom';
import React from 'dom-chef';
import features from '../libs/features';
import getTextNodes from '../libs/get-text-nodes';

const splittingRegex = /`(.*?)`/g;

function splitTextReducer(fragment: DocumentFragment, text: string, index: number) {
	// Code is always in odd positions
	if (index % 2 && text.length >= 1) {
		// `span.sr-only` keeps the backticks copy-pastable but invisible
		fragment.append(
			<code className="rgh-parse-backticks">
					<span className="sr-only">`</span>
				{text}
				<span className="sr-only">`</span>
			</code>
		);
	} else if (text.length > 0) {
		fragment.append(text);
	}

	return fragment;
}

function init() {
	for (const title of select.all('.issues-listing .js-navigation-open, .commit-title .js-navigation-open')) {
		for (const node of getTextNodes(title)) {
			const fragment = node.textContent!
				.split(splittingRegex)
				.reduce(splitTextReducer, new DocumentFragment());

			if (fragment.children.length > 0) {
				node.replaceWith(fragment);
			}
		}
	}
}

features.add({
	id: 'parse-backticks',
	include: [
		features.isDiscussionList,
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
