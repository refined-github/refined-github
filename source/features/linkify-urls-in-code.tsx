import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import linkifyIssues from 'linkify-issues';
import features from '../libs/features';
import linkify from '../libs/linkify-text-nodes';

// Shared class necessary to avoid also shortening the links
export const linkifiedURLClass = 'rgh-linkified-code';

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
		if (element.textContent!.length < 15) { // Must be long enough for a URL
			continue;
		}

		linkify(linkifyUrls, element, element.textContent!);
	}

	// Linkify issue refs in comments
	for (const element of select.all('span.pl-c', wrappers)) {
		linkify(linkifyIssues, element);
	}

	// Mark code block as touched
	for (const el of wrappers) {
		el.classList.add(linkifiedURLClass);
	}
}

features.add({
	id: __featureName__,
	description: 'Linkifies URLs in code.',
	screenshot: 'https://cloud.githubusercontent.com/assets/170270/25370217/61718820-29b3-11e7-89c5-2959eaf8cac8.png',
	include: [
		features.hasCode
	],
	load: features.onAjaxedPages,
	init
});
