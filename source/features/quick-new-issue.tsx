import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
import {expectElement as $$$} from 'select-dom';

import features from '../feature-manager.js';
import {buildRepoURL, getRepo, isArchivedRepoAsync} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

const labelId = 'rgh-quick-new-issue';

function add(listItem: HTMLElement): void {
	const newIssueItem = listItem.cloneNode(true);

	const link = $$$('a', newIssueItem);
	const label = $$$('[id="' + link.getAttribute('aria-labelledby')!.trim() + '"]', newIssueItem);
	link.setAttribute('aria-labelledby', labelId);
	label.id = labelId;

	link.href = buildRepoURL('issues/new/choose');
	label.textContent = `New issue in ${getRepo()?.name}`;

	$$$('svg', newIssueItem).replaceWith(<IssueOpenedIcon />);

	listItem.parentElement!.append(newIssueItem);

	const separator = $$$('[data-component="ActionList.Divider"]', listItem.parentElement!).cloneNode(true);
	newIssueItem.before(separator);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe('li:has(>a[href="/new/import"])', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		isArchivedRepoAsync,
	],
	init,
});

/*

Test URLs:

Repo home:
https://github.com/fregante/webext-storage-cache

Wiki, template picker:
https://github.com/refined-github/refined-github/wiki

Archived repo (feature disabled):
https://github.com/fregante/iphone-inline-video

*/
