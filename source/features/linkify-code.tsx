import {$$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';
import {
	codeElementsSelector,
	linkifiedURLClass,
	linkifyURLs,
	linkifyIssues,
} from '../github-helpers/dom-formatters.js';

function linkifyContent(wrapper: Element): void {
	// Mark code block as touched to avoid `shorten-links` from acting on these new links in code
	wrapper.classList.add(linkifiedURLClass);

	linkifyURLs(wrapper);

	const currentRepo = pageDetect.isGlobalSearchResults()
		// Look for the link on the line number
		? getRepo(wrapper.parentElement!.querySelector('.blob-num a')!.href)
		: getRepo();
	// Some non-repo pages like gists have issue references #3844
	// They make no sense, but we still want `linkifyURLs` to run there
	if (!currentRepo) {
		return;
	}

	for (const element of $$optional('.pl-c', wrapper)) {
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
});

/*

## Test URLs

- URLs/issues in comments: https://github.com/refined-github/sandbox/pull/98
- URLs in PR files: https://github.com/refined-github/refined-github/pull/546/files#diff-7296d5f600098588b0af5ec9c84486593be79164f97406a0fc3c4ef5211ab2f9
- URLs in regular files: https://github.com/refined-github/refined-github/blob/3f5fc489e417d4f4a14da5ea423775e9ca9246fd/source/features/copy-markdown.js#L45 (broken: #6336)
- Issue reference in file: https://github.com/refined-github/refined-github/blob/2ade9a84b1894c7879fab9d3e2d045e876f941a6/source/features/sort-issues-by-update-time.tsx#L18 (broken: #6336)
- Code Search: https://github.com/search?q=repo%3AKatsuteDev%2FBackground+marketplace&type=code
- Code Search: https://github.com/search?q=%2F%23%5Cd%7B4%2C%7D%2F+language%3Atypescript&type=code
- Code Search that might break: https://github.com/search?q=path%3A.npmrc&type=code
- Clipped URL that shouldn't be linkified: https://github.com/sindresorhus/linkify-urls/pull/40#pullrequestreview-1593302757

*/
