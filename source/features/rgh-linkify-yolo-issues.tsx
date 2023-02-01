import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import {getRghIssueUrl} from '../helpers/rgh-issue-link';
import {isAnyRefinedGitHubRepo} from '../github-helpers';

function init(): void {
	for (const issueCell of select.all('.js-csv-data td:nth-child(3)')) {
		wrap(issueCell.firstChild!, <a href={getRghIssueUrl(issueCell.textContent!)}/>);
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		isAnyRefinedGitHubRepo,
	],
	include: [
		pageDetect.isRepo,
		pageDetect.isSingleFile,
		() => new URLSearchParams(location.pathname).has('broken-features.csv'),
	],
	awaitDomReady: false,
	init,
});
