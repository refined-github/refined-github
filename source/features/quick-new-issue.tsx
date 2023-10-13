import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {IssueOpenedIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import {buildRepoURL, getRepo, isArchivedRepoAsync} from '../github-helpers/index.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';
import observe from '../helpers/selector-observer.js';

function addLegacy(dropdownMenu: HTMLElement): void {
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

function add(dropdownMenu: HTMLElement): void {
	dropdownMenu.append(
		<li role="presentation" aria-hidden="true" data-view-component="true" className="ActionList-sectionDivider"/>,
		<li data-targets="action-list.items" role="none" data-view-component="true" className="ActionListItem">
			<a href={buildRepoURL('issues/new/choose')} tabIndex={-1} role="menuitem" data-view-component="true" className="ActionListContent ActionListContent--visual16">
				<span className="ActionListItem-visual ActionListItem-visual--leading">
					<IssueOpenedIcon/>
				</span>
				<span data-view-component="true" className="ActionListItem-label">
					New issue in {getRepo()?.name}
				</span>
			</a>
		</li>,
	);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe('#global-create-menu-list', add, {signal});

	// TODO: Drop after Global Navigation update (Nov 2023)
	observe('.Header-item .dropdown-menu:has(> [data-ga-click="Header, create new repository"])', addLegacy, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isHasSelectorSupported,
	],
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
