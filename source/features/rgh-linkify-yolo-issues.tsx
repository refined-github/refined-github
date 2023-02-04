import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import {getRghIssueUrl} from '../helpers/rgh-issue-link';
import {isRefinedGitHubYoloRepo} from '../github-helpers';

function init(): void {
	// .js-csv-data is the old selector
	for (const issueCell of select.all(':is(.js-csv-data, .react-csv-row) td:nth-child(3)')) {
		wrap(issueCell.firstChild!, <a href={getRghIssueUrl(issueCell.textContent!)}/>);
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubYoloRepo,
		pageDetect.isSingleFile,
		() => location.pathname.endsWith('broken-features.csv'),
	],
	init,
});
