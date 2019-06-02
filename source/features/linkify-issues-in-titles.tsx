import select from 'select-dom';
import zipTextNodes from 'zip-text-nodes';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import parseBackticks from '../libs/parse-backticks';
import {linkifyIssuesInDom} from './linkify-urls-in-code';

function init(): void {
	observeEl(
		select('#partial-discussion-header')!.parentElement!,
		() => {
			const title = select('.js-issue-title:not(.rgh-formatted-title)');

			if (title) {
				title.classList.add('rgh-formatted-title');
				linkifyIssuesInDom(title);

				const fragment = parseBackticks(title.textContent!);

				if (fragment.children.length > 0) {
					zipTextNodes(title, fragment);
				}
			}
		});
}

features.add({
	id: 'linkify-issues-in-titles',
	description: 'Make issue/PR references in issue/PR titles clickable',
	include: [
		features.isPR,
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
