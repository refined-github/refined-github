import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import linkifyIssues from 'linkify-issues';
import features from '../libs/features';
import editTextNodes, {linkifiedURLClass} from '../libs/linkify-text-nodes';

function init(): false | void {
	const wrappers = select.all(`
		.blob-wrapper:not(.${linkifiedURLClass}),
		.comment-body:not(.${linkifiedURLClass})
	`);

	// Don't linkify any already linkified code
	if (wrappers.length === 0) {
		return false;
	}

	// Linkify full URLs
	// `.blob-code-inner` in diffs
	// `pre` in GitHub comments
	for (const el of select.all('.blob-code-inner, pre', wrappers)) {
		editTextNodes(linkifyUrls, el);
	}

	// Linkify issue refs in comments
	for (const el of select.all('span.pl-c', wrappers)) {
		editTextNodes(linkifyIssues, el);
	}

	// Mark code block as touched
	for (const el of wrappers) {
		el.classList.add(linkifiedURLClass);
	}
}

features.add({
	id: 'linkify-urls-in-code',
	description: 'Make URLs in code clickable',
	load: features.onAjaxedPages,
	init
});
