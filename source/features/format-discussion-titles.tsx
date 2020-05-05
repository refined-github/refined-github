import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import observeElement from '../libs/simplified-element-observer';
import * as domFormatters from '../libs/dom-formatters';

function init(): void {
	const ajaxedTitleArea = select('#partial-discussion-header')!.parentElement!;
	observeElement(ajaxedTitleArea, () => {
		for (const title of select.all('.js-issue-title:not(.rgh-formatted-title)')) {
			title.classList.add('rgh-formatted-title');
			domFormatters.linkifyIssues(title);
			domFormatters.parseBackticks(title);
		}
	});
}

features.add({
	id: __filebasename,
	description: 'Make issue/PR references in issue/PR titles clickable and parse `code in backticks` that appear as Markdown',
	screenshot: 'https://user-images.githubusercontent.com/22439276/58927232-71ae2780-876b-11e9-941e-bb56a7389123.png'
}, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue
	],
	init
});
