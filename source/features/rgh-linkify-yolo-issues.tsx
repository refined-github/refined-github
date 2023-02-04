import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {isRefinedGitHubYoloRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';
import {linkifyIssues} from '../github-helpers/dom-formatters';

// Linkify with hovercards
function linkify(issueCell: HTMLElement): void {
	issueCell.textContent = '#' + issueCell.textContent!;
	linkifyIssues({owner: 'refined-github', name: 'refined-github'}, issueCell);
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
	awaitDomReady: false,
	init,
});
