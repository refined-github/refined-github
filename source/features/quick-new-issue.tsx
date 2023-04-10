import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {buildRepoURL, getRepo, isArchivedRepoAsync} from '../github-helpers';
import observe from '../helpers/selector-observer';

function add(dropdownMenu: HTMLElement): void {
	dropdownMenu.append(
		<div role="none" className="dropdown-divider"/>,
		<div className="dropdown-header">
			<span title={getRepo()?.name}>This repository</span>
		</div>,
		<a role="menuitem" className="dropdown-item" href={buildRepoURL('issues/new/choose')}>
			New issue
		</a>,
	);
}

async function init(signal: AbortSignal): Promise<void | false> {
	if (await isArchivedRepoAsync()) {
		return false;
	}

	observe([
		'.dropdown-menu:has(>[data-analytics-event*=\'"label":"new repository"\'])',

		// TODO: Drop after Global Navigation update (Nov 2023)
		'.Header-item .dropdown-menu:has(> [data-ga-click="Header, create new repository"])',
	], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
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
