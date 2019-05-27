import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import zipTextNodes from 'zip-text-nodes';
import linkifyIssues from 'linkify-issues';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';

export function linkifyIssuesInDom(element: Element): void {
	const linkified = linkifyIssues(element.textContent!, options);
	if (linkified.children.length === 0) { // Children are <a>
		return;
	}

	// Enable native issue title fetch
	for (const link of (linkified.children as HTMLCollectionOf<HTMLAnchorElement>)) {
		const issue = link.href.split('/').pop();
		link.setAttribute('class', 'issue-link js-issue-link tooltipped tooltipped-ne');
		link.setAttribute('data-error-text', 'Failed to load issue title');
		link.setAttribute('data-permission-text', 'Issue title is private');
		link.setAttribute('data-url', link.href);
		link.setAttribute('data-id', `rgh-issue-${issue}`);
	}

	zipTextNodes(element, linkified);
}

// Shared class necessary to avoid also shortening the links
export const linkifiedURLClass = 'rgh-linkified-code';

// If we are not in a repo, relative issue references won't make sense
// but `user`/`repo` need to be set to avoid breaking errors in `linkify-issues`
// https://github.com/sindresorhus/refined-github/issues/1305
const currentRepo = getOwnerAndRepo();
const options = {
	user: currentRepo.ownerName || '/',
	repo: currentRepo.repoName || '/',
	type: 'dom',
	baseUrl: '',
	attributes: {
		rel: 'noreferrer noopener',
		class: linkifiedURLClass // Necessary to avoid also shortening the links
	}
};

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

		const linkified = linkifyUrls(element.textContent!, options);
		if (linkified.children.length === 0) { // Children are <a>
			continue;
		}

		zipTextNodes(element, linkified);
	}

	// Linkify issue refs in comments
	for (const element of select.all('span.pl-c', wrappers)) {
		linkifyIssuesInDom(element);
	}

	// Mark code block as touched
	for (const el of wrappers) {
		el.classList.add(linkifiedURLClass);
	}
}

features.add({
	id: 'linkify-urls-in-code',
	description: 'Make URLs in code clickable',
	include: [
		features.hasCode
	],
	load: features.onAjaxedPages,
	init
});
