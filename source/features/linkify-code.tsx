import {$$, elementExists} from 'select-dom';
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
		if (!elementExists('a', title)) {
			linkifyIssues(currentRepo, title);
		}
	}, {signal});
}

function linkifyContent(wrapper: Element): void {
	// Mark code block as touched to avoid `shorten-links` from acting on these new links in code
	wrapper.classList.add(linkifiedURLClass);

	const errors = linkifyURLs(wrapper);
	if (errors) {
		features.log.error(import.meta.url, 'Links already exist');
		console.log(errors);
	}

	const currentRepo = pageDetect.isGlobalSearchResults()
		// Look for the link on the line number
		? getRepo(wrapper.parentElement!.querySelector('.blob-num a')!.href)
		: getRepo();
	// Some non-repo pages like gists have issue references #3844
	// They make no sense, but we still want `linkifyURLs` to run there
	if (!currentRepo) {
		return;
	}

	for (const element of $$('.pl-c', wrapper)) {
		linkifyIssues(currentRepo, element);
	}
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
- Code Search: https://github.com/search?q=%2F%23%5Cd%7B4%2C%7D%2F+language%3Atypescript&type=code
- Comment: https://github.com/sindresorhus/linkify-urls/pull/40#pullrequestreview-1593302757

*/
