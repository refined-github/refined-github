import './show-whitespaces.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import onPrFileLoad from '../libs/on-pr-file-load';
import onNewComments from '../libs/on-new-comments';
import getTextNodes from '../libs/get-text-nodes';

function showWhiteSpacesOn(line: Element): void {
	const textNodes = getTextNodes(line);

	for (const textNode of textNodes) {
		const nodeValue = textNode.textContent!;
		if (nodeValue.length === 0) {
			continue;
		}

		const fragment = document.createDocumentFragment();

		let lastEncounteredCharType;
		let charType: 'space' | 'tab' | 'other';
		let node;

		for (const char of nodeValue) {
			if (char === ' ') {
				charType = 'space';
			} else if (char === '\t') {
				charType = 'tab';
			} else {
				charType = 'other';
			}

			if ((lastEncounteredCharType && lastEncounteredCharType === charType) && node) {
				node.textContent += char;

				if (charType === 'space') {
					node.dataset.rghSpaces += '·';
				} else if (charType === 'tab') {
					node.dataset.rghTabs += '→';
				}
			} else {
				if (node) {
					fragment.append(node);
				}

				if (charType === 'space') {
					node = <span className="pl-ws pl-space" data-rgh-spaces="·">{char}</span>;
				} else if (charType === 'tab') {
					node = <span className="pl-ws pl-tab" data-rgh-tabs="→">{char}</span>;
				} else {
					node = <>{char}</>;
				}
			}

			lastEncounteredCharType = charType;
		}

		if (node) {
			fragment.append(node);
		}

		textNode.replaceWith(fragment);
	}
}

function run(): void {
	const tables = select.all([
		'table.js-file-line-container:not(.rgh-showing-whitespace)', // Single blob file, and gist
		'.file table.diff-table:not(.rgh-showing-whitespace)', // Split and unified diffs
		'.file table.d-table:not(.rgh-showing-whitespace)' // "Suggested changes" in PRs
	].join());

	for (const table of tables) {
		table.classList.add('rgh-showing-whitespace');

		for (const line of select.all('.blob-code-inner', table)) {
			showWhiteSpacesOn(line);
		}
	}
}

function init(): void {
	run();
	onNewComments(run);
	onPrFileLoad(run);
}

features.add({
	id: __featureName__,
	description: 'Renders whitespace characters in code',
	include: [
		features.hasCode
	],
	load: features.onAjaxedPages,
	init
});
