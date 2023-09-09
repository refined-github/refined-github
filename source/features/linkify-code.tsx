import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';
import {codeElementsSelector, linkifiedURLClass, linkifyURLs, linkifyIssues} from '../github-helpers/dom-formatters.js';

function initTitle(signal: AbortSignal): void {
	// If we are not in a repo, relative issue references won't make sense but `user`/`repo` needs to be set to avoid breaking errors in `linkify-issues`
	// https://github.com/refined-github/refined-github/issues/1305
	const currentRepo = getRepo() ?? {};

	observe('.js-issue-title', title => {
		// TODO: Replace with :has
		if (!select.exists('a', title)) {
			linkifyIssues(currentRepo, title);
		}
	}, {signal});
}

function linkifyContent(wrapper: Element): void {
	const errors = linkifyURLs(wrapper);
	if (errors) {
		features.log.error(import.meta.url, 'Links already exist');
		console.log(errors);
	}

	// Linkify issue refs in comments, exclude gists:
	// https://github.com/refined-github/refined-github/pull/3844#issuecomment-751427568
	if (!pageDetect.isGist()) {
		const currentRepo = getRepo() ?? {};
		for (const element of select.all('.pl-c', wrapper)) {
			linkifyIssues(currentRepo, element);
		}
	}

	// Mark code block as touched to avoid `shorten-links` from acting on these new links in code
	wrapper.classList.add(linkifiedURLClass);
}

function init(signal: AbortSignal): void {
	observe(codeElementsSelector, linkifyContent, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasCode,
	],
	init,
}, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue,
		pageDetect.isDiscussion,
	],
	init: initTitle,
});

/*

## Test URLs

- Discussions: https://github.com/File-New-Project/EarTrumpet/discussions/877
- Code Search: https://github.com/search?q=repo%3AKatsuteDev%2FBackground+marketplace&type=code
- Comment: https://github.com/sindresorhus/linkify-urls/pull/40#pullrequestreview-1593302757

*/
