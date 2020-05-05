import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {linkifiedURLClass, linkifyURLs, linkifyIssues} from '../libs/dom-formatters';

function init(): false | void {
	const wrappers = select.all(`
		.js-blob-wrapper:not(.${linkifiedURLClass}),
		.blob-wrapper:not(.${linkifiedURLClass}),
		.comment-body:not(.${linkifiedURLClass})
	`);

	if (wrappers.length === 0) {
		return false;
	}

	// Linkify full URLs
	// `.blob-code-inner` in diffs
	// `pre` in GitHub comments
	for (const element of select.all('.blob-code-inner, pre', wrappers)) {
		linkifyURLs(element);
	}

	// Linkify issue refs in comments
	for (const element of select.all('span.pl-c', wrappers)) {
		linkifyIssues(element);
	}

	// Mark code block as touched
	for (const element of wrappers) {
		element.classList.add(linkifiedURLClass);
	}
}

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
