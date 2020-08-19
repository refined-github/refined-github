import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as domFormatters from '../github-helpers/dom-formatters';
import observeElement, {observeOneMutation} from '../helpers/simplified-element-observer';

let headerWrapper: HTMLElement;

function init(): void {
	for (const title of select.all('.js-issue-title:not(.rgh-formatted-title)')) {
		title.classList.add('rgh-formatted-title');
		domFormatters.linkifyIssues(title);
		domFormatters.parseBackticks(title);
	}
}

async function submitHandler(event: Event) {
	const form = event.target as HTMLFormElement;

	if (!form.id.startsWith('edit_header')) {
		return;
	}

	const title = select('.js-issue-title')!;

	await observeOneMutation(title, {
		subtree: false,
		childList: true
	});

	domFormatters.linkifyIssues(title);
	domFormatters.parseBackticks(title);
}

void features.add({
	id: __filebasename,
	description: 'Make issue/PR references in issue/PR titles clickable and parse `code in backticks` that appear as Markdown',
	screenshot: 'https://user-images.githubusercontent.com/22439276/58927232-71ae2780-876b-11e9-941e-bb56a7389123.png'
}, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue
	],
	init() {
		headerWrapper = select('#partial-discussion-header')!.parentElement!;

		observeElement(headerWrapper, init);
		headerWrapper.addEventListener('submit', submitHandler);
	},
	deinit: () => headerWrapper.removeEventListener('submit', submitHandler)
});
