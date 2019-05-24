import './show-whitespaces.css';
import React from 'dom-chef';
import features from '../libs/features';

function loop(line: Element) {
	const nodes = [...line.childNodes.values()].filter(node => node.nodeType === 3);

	for (const textNode of nodes)  {
		const nodeValue = textNode!.textContent!;
		if (nodeValue.length !== 0 && (nodeValue.trim() !== nodeValue)) {
			const fragment = document.createDocumentFragment();

			for (const char of nodeValue) {
				if (char === '\t') {
					fragment.appendChild(<span className="pl-ws pl-tab"></span>);
				} if (char === ' ') {
					fragment.appendChild(<span className="pl-ws pl-space">{char}</span>);
				} else {
					fragment.append(char);
				}
			}

			console.log(textNode, fragment.childNodes);

			textNode.replaceWith(fragment);
		}
	}

	// Add a new-line character at the end (optional)
	const br = line.querySelector('br');
	line.insertBefore(<span className="pl-ws pl-nl"></span>, br);
}

function init() {
	const lines = document.querySelectorAll('.blob-code-inner');

	for (const line of lines) {
		// const iterator = document.createNodeIterator(line, NodeFilter.SHOW_TEXT);
		requestAnimationFrame(() => loop(line));

		// const span = document.createElement('span');
		// span.classList.add('pl-ws');
		// span.textContent = '¬';
		// line.appendChild(span);
	}
}

features.add({
	id: 'show-whitespaces',
	description: 'Show whitespace characters in diffs',
	init: () => {
		setTimeout(init, 2000);
	},
	load: features.onAjaxedPages
});
