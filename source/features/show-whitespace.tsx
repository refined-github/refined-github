import './show-whitespace.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import onPrFileLoad from '../libs/on-pr-file-load';
import onNewComments from '../libs/on-new-comments';
import getTextNodes from '../libs/get-text-nodes';

function showWhiteSpacesOn(line: Element): void {
	const textNodes = getTextNodes(line);

	for (const textNode of textNodes) {
		const textContent = textNode.textContent!;
		if (textContent.length === 0 || !(textContent.includes(' ') || textContent.includes('\t'))) {
			continue;
		}

		const fragment = document.createDocumentFragment();

		let lastEncounteredCharType;
		let charType: 'space' | 'tab' | 'other';
		let node;

		for (const char of textContent) {
			if (char === ' ') {
				charType = 'space';
			} else if (char === '\t') {
				charType = 'tab';
			} else {
				charType = 'other';
			}

			if (node && lastEncounteredCharType === charType) {
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
					node = <span className="rgh-ws-char rgh-space-char" data-rgh-spaces="·">{char}</span>;
				} else if (charType === 'tab') {
					node = <span className="rgh-ws-char rgh-tab-char" data-rgh-tabs="→">{char}</span>;
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

function * getLineIterator(): IterableIterator<Element> {
	const tables = select.all([
		'table.js-file-line-container:not(.rgh-showing-whitespace)', // Single blob file, and gist
		'.file table.diff-table:not(.rgh-showing-whitespace)', // Split and unified diffs
		'.file table.d-table:not(.rgh-showing-whitespace)' // "Suggested changes" in PRs
	].join());

	for (const table of tables) {
		table.classList.add('rgh-showing-whitespace');

		for (const line of select.all('.blob-code-inner', table)) {
			yield line;
		}
	}
}

async function run(): Promise<void> {
	const iterator = getLineIterator();

	let processedLineCount = 0;
	let iteratorResult: IteratorResult<Element>;

	// Process 100 lines at a time for each event loop, without janking the main thread
	const loop = async (): Promise<void> => {
		for (let i = 0; i < 100; i++) {
			iteratorResult = iterator.next();
			if (iteratorResult.done) {
				break;
			}

			showWhiteSpacesOn(iteratorResult.value);
			processedLineCount++;
		}

		console.log(`Processed ${processedLineCount} lines`);

		if (processedLineCount >= 10000) {
			console.warn('Stopped showing whitespaces, too many lines to process!');
			return;
		}

		if (!iteratorResult.done) {
			await new Promise(resolve => setTimeout(resolve));
			loop();
		}
	};

	loop();
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
