import * as pageDetect from 'github-url-detection';

import React from 'dom-chef';

import select from 'select-dom';

import features from '../feature-manager';

import {wrap} from '../helpers/dom-utils';

import {getRghIssueUrl} from '../helpers/rgh-issue-link';

function init(): void {
	for (const issueCell of select.all('td:nth-child(3)')) {
		wrap(issueCell.firstChild!, <a href={getRghIssueUrl(issueCell.textContent!)}/>);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
		pageDetect.hasCode,
		pageDetect.isSingleFile,
	],
	awaitDomReady: false,
	init,
});
