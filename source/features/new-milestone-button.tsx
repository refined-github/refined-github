/**
@description Adds a 'New Milestone' button to the milestone page.
@screenshot https://github.com/user-attachments/assets/1fceb336-6d32-4733-afe0-9971989b1987
*/

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function addButton(editButton: Element): void {
	editButton.before(
		<a
			href={buildRepoUrl('milestones/new')}
			className="btn"
		>
			New Milestone
		</a>,
	);
}

function init(signal: AbortSignal): void {
	const repoBase = buildRepoUrl('milestones');

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
