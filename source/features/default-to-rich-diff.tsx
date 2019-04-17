import select from 'select-dom';
import features from '../libs/features';

const observer = new MutationObserver(([{addedNodes}]) => {
	for (const node of addedNodes) {
		if (node instanceof Element) {
			if (node.matches('.js-diff-progressive-container')) {
				observer.observe(node, {childList: true});
			} else {
				setRichDiff(node);
			}
		}
	}
});

function setRichDiff(node: Element | null) {
	if (node) {
		for (const fileHeader of select.all('.file-header[data-file-type=".svg"] [aria-label="Display the rich diff"]', node)) {
			fileHeader.click();
		}
	}
}

function init() {
	setRichDiff(select('.js-diff-progressive-container:first-child'));
	const lastProgressiveContainer = select('.js-diff-progressive-container:last-child');
	if (lastProgressiveContainer) {
		observer.observe(lastProgressiveContainer, { childList: true });
	}
}

features.add({
	id: 'default-to-rich-diff',
	include: [
		features.isCommit,
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
