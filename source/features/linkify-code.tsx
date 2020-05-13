import oneTime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';
import OnceVisibleObserver from '../libs/once-visible-observer';
import {linkifyURLs, linkifyIssues} from '../libs/dom-formatters';

function anySelector(selector: string) {
	// @ts-ignore MozOrient
	const prefix = document.head.style.MozOrient === '' ? 'moz' : 'webkit';
	return selector.replace(/:any\(/g, `:-${prefix}-any(`);
}

const containerSelector = `
	:any(
		.js-blob-wrapper,
		.blob-wrapper,
		.comment-body
	)
`;

const issuesObserver = new OnceVisibleObserver(linkifyIssues);
const urlObserver = new OnceVisibleObserver(linkifyURLs);

const init = oneTime((): void => {
	// Linkify issue refs in comments
	observe(anySelector(`${containerSelector} span.pl-c`), {
		add: issuesObserver.observe.bind(issuesObserver),
		remove: issuesObserver.unobserve.bind(issuesObserver)
	});

	// Linkify full URLs
	// `.blob-code-inner` in diffs
	// `pre` in GitHub comments
	observe(anySelector(`
		${containerSelector}
		:any(
			pre,
			.blob-code-inner
		)
	`), {
		add: urlObserver.observe.bind(urlObserver),
		remove: urlObserver.unobserve.bind(urlObserver)
	});
});

features.add({
	id: __filebasename,
	description: 'Linkifies URLs and issue references in code.',
	screenshot: 'https://cloud.githubusercontent.com/assets/170270/25370217/61718820-29b3-11e7-89c5-2959eaf8cac8.png'
}, {
	include: [
		pageDetect.hasCode
	],
	init
});
