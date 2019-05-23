import './parse-backticks.css';
import select from 'select-dom';
import features from '../libs/features';
import getTextNodes from '../libs/get-text-nodes';
import parseBackticks from '../libs/parse-backticks';

function init(): void {
	for (const title of select.all(`
		[aria-label="Issues"][role="group"] .js-navigation-open,
		.commit-title .js-navigation-open
	`)) {
		for (const node of getTextNodes(title)) {
			const fragment = parseBackticks(node.textContent!);

			if (fragment.children.length > 0) {
				node.replaceWith(fragment);
			}
		}
	}
}

features.add({
	id: 'parse-backticks',
	description: 'Parse `code in backticks` that appear in issue titles as Markdown',
	screenshot: 'https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png',
	include: [
		features.isDiscussionList,
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
