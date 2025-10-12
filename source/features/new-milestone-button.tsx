import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {buildRepoURL} from '../github-helpers/index.js';

function addButton(editButton: Element): void {
	editButton.before(
		<a
			href={buildRepoURL('milestones/new')}
			className="btn"
		>
			New Milestone
		</a>,
	);
}

function init(signal: AbortSignal): void {
	const repoBase = buildRepoURL('milestones');

	observe(`a[href*="${repoBase}/"][href$="/edit"]`, addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isMilestone,
	],
	init,
});

/*
Test URLs:

https://github.com/go-gitea/gitea/milestone/186
*/
