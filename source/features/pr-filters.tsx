import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {$} from 'select-dom';
import {CheckIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';
import {cacheByRepo} from '../github-helpers/index.js';
import HasChecks from './pr-filters.gql';

const reviewsFilterSelector = '#reviews-select-menu';

function addDropdownItem(dropdown: HTMLElement, title: string, filterCategory: string, filterValue: string): void {
	const filterQuery = `${filterCategory}:${filterValue}`;

	const searchParameter = new URLSearchParams(location.search);
	const currentQuerySegments = searchParameter.get('q')?.split(/\s+/) ?? [];
	const isSelected = currentQuerySegments.some(
		segment => segment.toLowerCase() === filterQuery,
	);

	const query = currentQuerySegments.filter(
		segment => !segment.startsWith(`${filterCategory}:`),
	).join(' ');

	const search = new URLSearchParams({
		q: query + (isSelected ? '' : ` ${filterQuery}`),
	});

	dropdown.append(
		<a
			href={`?${String(search)}`}
			className="SelectMenu-item"
			aria-checked={isSelected ? 'true' : 'false'}
			role="menuitemradio"
		>
			<CheckIcon className="SelectMenu-icon SelectMenu-icon--check"/>
			<span>{title}</span>
		</a>,
	);
}

function addDraftFilter(dropdown: HTMLElement): void {
	dropdown.append(
		<div className="SelectMenu-divider">
			Filter by draft pull requests
		</div>,
	);

	addDropdownItem(dropdown, 'Ready for review', 'draft', 'false');
	addDropdownItem(dropdown, 'Not ready for review (Draft PR)', 'draft', 'true');
}

const hasChecks = new CachedFunction('has-checks', {
	async updater(): Promise<boolean> {
		const {repository} = await api.v4(HasChecks);

		return repository.head.history.nodes.some((commit: AnyObject) => commit.statusCheckRollup);
	},
	maxAge: {days: 3},
	cacheKey: cacheByRepo,
});

async function addChecksFilter(reviewsFilter: HTMLElement): Promise<void> {
	if (!await hasChecks.get()) {
		return;
	}

	// Copy existing element and adapt its content
	const checksFilter = reviewsFilter.cloneNode(true);
	checksFilter.id = '';

	$('summary', checksFilter)!.firstChild!.textContent = 'Checks\u00A0'; // Only replace text node, keep caret
	$('.SelectMenu-title', checksFilter)!.textContent = 'Filter by checks status';

	const dropdown = $('.SelectMenu-list', checksFilter)!;
	dropdown.textContent = ''; // Drop previous filters

	for (const status of ['Success', 'Failure', 'Pending']) {
		addDropdownItem(dropdown, status, 'status', status.toLowerCase());
	}

	reviewsFilter.after(checksFilter);
}

async function init(signal: AbortSignal): Promise<void> {
	observe(reviewsFilterSelector, addChecksFilter, {signal});
	observe(`${reviewsFilterSelector} .SelectMenu-list`, addDraftFilter, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRList,
	],
	init,
});

/*

Test URLs:

https://github.com/pulls
https://github.com/refined-github/refined-github/pulls

*/
