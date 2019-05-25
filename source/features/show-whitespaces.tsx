import './show-whitespaces.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import onPrFileLoad from '../libs/on-pr-file-load';
import onNewComments from '../libs/on-new-comments';

const queue: Node[] = [];

// Process a single line for each frame loop
function loop(): void {
	const line = queue.shift();

	if (line === undefined) {
		return;
	}

	const iterator = document.createNodeIterator(line, NodeFilter.SHOW_TEXT, {
		acceptNode: node => {
			if (node.childNodes.length === 0) {
				return NodeFilter.FILTER_ACCEPT;
			}

			return NodeFilter.FILTER_REJECT;
		}
	});

	const textNodes = [];
	let node;

	// Collect all nodes before modifying the root node anymore
	while ((node = iterator.nextNode())) {
		textNodes.push(node);
	}

	for (const textNode of textNodes) {
		const nodeValue = textNode.textContent!;
		if (nodeValue.length !== 0) {
			const fragment = document.createDocumentFragment();

			for (const char of nodeValue) {
				if (char === '\t') {
					fragment.append(<span className="pl-ws pl-tab">{char}</span>);
				} else if (char === ' ') {
					fragment.append(<span className="pl-ws pl-space">{char}</span>);
				} else {
					fragment.append(char);
				}
			}

			(textNode as Element).replaceWith(fragment);
		}
	}

	// Add a new-line character at the end (optional)
	// const br = line.querySelector('br');
	// line.insertBefore(<span className="pl-ws pl-nl">&nbsp;</span>, br);

	requestAnimationFrame(loop);
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
			queue.push(line);
		}
	}

	requestAnimationFrame(loop);
}

function init(): void {
	run();
	onNewComments(run);
	onPrFileLoad(run);
}

features.add({
	id: 'show-whitespaces',
	description: 'Show whitespace characters in diffs',
	include: [
		features.isSingleFile,
		features.isPRFiles,
		features.isCommit,
		features.isPRConversation,
		features.isGist,
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
