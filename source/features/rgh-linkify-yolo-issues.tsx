import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import {getRghIssueUrl} from '../helpers/rgh-issue-link';
import {isRefinedGitHubYoloRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';

function linkify(issueCell: HTMLElement): void {
	wrap(issueCell.firstChild!, <a href={getRghIssueUrl(issueCell.textContent!)}/>);
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
