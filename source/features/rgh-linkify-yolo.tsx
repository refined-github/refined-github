import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {isRefinedGitHubYoloRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {createRghIssueLink, getFeatureUrl} from '../helpers/rgh-links.js';

function linkifyIssue(issueCell: HTMLElement): void {
	// Linkify with hovercards
	issueCell.replaceChildren(createRghIssueLink(issueCell.textContent));
}

function linkifyFeature(issueCell: HTMLElement): void {
	const url = getFeatureUrl(issueCell.textContent as FeatureID);
	issueCell.replaceChildren(<code>
		<a className='d-inline-block' href={url}>
			{issueCell.firstChild}
		</a>
	</code>);
}

function init(signal: AbortSignal): void {
	// .js-csv-data is the old selector
	observe(':is(.js-csv-data, .react-csv-row) td:nth-child(2)', linkifyFeature, {signal});
	observe(':is(.js-csv-data, .react-csv-row) td:nth-child(3)', linkifyIssue, {signal});
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
