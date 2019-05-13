import select from 'select-dom';
import linkifyIssues from 'linkify-issues';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import {editTextNodes} from './linkify-urls-in-code';

function init(): void {
	observeEl(
		select('#partial-discussion-header')!.parentElement!,
		() => {
			const title = select('.js-issue-title:not(.refined-linkified-title)');
			if (title) {
				title.classList.add('refined-linkified-title');
				editTextNodes(linkifyIssues, title);
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
