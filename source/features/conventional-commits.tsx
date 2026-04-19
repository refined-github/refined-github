/*

This feature is documented at https://github.com/refined-github/refined-github/wiki/Customization#conventional-commits

*/

import './conventional-commits.css';

import React from 'react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {commitTitleInLists} from '../github-helpers/selectors.js';
import {conventionalCommitRegex, parseConventionalCommit} from '../helpers/conventional-commits.js';
import {removeTextInTextNode} from '../helpers/dom-utils.js';

function renderLabelInCommitTitle(commitTitleElement: HTMLElement): void {
	const textNode = commitTitleElement.firstChild!;
	const commit = parseConventionalCommit(textNode.textContent);

	if (!commit) {
		return;
	}

	if (
		// Skip commits that are _only_ "ci:" without anything else. Rare but it would be confusing to show just the label
		commit.raw === textNode.textContent
		&& !commitTitleElement.nextElementSibling

		// Ensure that the element contains only plain text, not stuff like <code>
		&& commitTitleElement.childElementCount < 1
	) {
		return;
	}

	commitTitleElement.prepend(
		<span className="IssueLabel hx_IssueLabel mr-2" rgh-conventional-commits={commit.rawType}>
			{commit.type}
		</span>,

		// Keep scope outside because that's how they're rendered in release notes as well
		commit.scope ? <span className="color-fg-muted">{commit.scope}</span> : '',
	);

	removeTextInTextNode(textNode, conventionalCommitRegex);
}

function init(signal: AbortSignal): void {
	observe(`${commitTitleInLists} > span > a:first-child`, renderLabelInCommitTitle, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
	],
	init,
});

/*

Test URLs:

- Repo commits: https://github.com/refined-github/sandbox/commits/conventional-commits/
- PR commits: https://github.com/refined-github/sandbox/pull/91/commits
- Real data: https://github.com/conventional-changelog/standard-version/commits
- Repo without conventional commits: https://github.com/refined-github/refined-github/commits

*/
