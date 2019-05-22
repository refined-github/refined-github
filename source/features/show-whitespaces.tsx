import features from '../libs/features';

function loop(iterator: NodeIterator) {
	if (iterator) {
		const nodes = [];
		let node;

		while ((node = iterator.nextNode())) {
			nodes.push(node);
		}

		console.log(nodes);

		for (const textNode of nodes)  {
			const nodeValue = textNode!.textContent!;
			if (nodeValue.length !== 0 && (nodeValue.trim() !== nodeValue)) {

				const spans = [];
				let span;
				let lastEncounteredChar;
				for (const char of nodeValue) {
					if (lastEncounteredChar !== char) {
						if (span) {
							spans.push(span);
						}

						span = document.createElement('span');
						lastEncounteredChar = char;
					}

					if (char === ' ') {
						span!.classList.add('pl-ws');
						span!.classList.add('pl-space');
						span!.textContent += '·';
					} else if (char === '\t') {
						span!.classList.add('pl-ws');
						span!.classList.add('pl-tab');
						span!.textContent += '→';
					} else {
						span!.textContent += char;
					}
				}

				// console.log(span);

				for (const span of spans) {
					textNode.parentNode!.insertBefore(span, textNode);
				}
			}
		}
	}
}

function init() {
	const lines = document.querySelectorAll('.blob-code-inner');

	console.log(lines);

	for (const line of lines) {
		const iterator = document.createNodeIterator(line, NodeFilter.SHOW_TEXT);
		requestAnimationFrame(() => loop(iterator));

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
