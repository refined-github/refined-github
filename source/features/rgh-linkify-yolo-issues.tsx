import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {isRefinedGitHubYoloRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {createRghIssueLink} from '../helpers/rgh-issue-link.js';

// Linkify with hovercards
function linkify(issueCell: HTMLElement): void {
	issueCell.replaceChildren(createRghIssueLink(issueCell.textContent));
}

function init(signal: AbortSignal): void {
	// .js-csv-data is the old selector
	observe(':is(.js-csv-data, .react-csv-row) td:nth-child(3)', linkify, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubYoloRepo,
		pageDetect.isSingleFile,
		() => location.pathname.endsWith('broken-features.csv'),
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/yolo/blob/main/broken-features.csv

*/
