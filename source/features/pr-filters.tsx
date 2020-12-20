import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import delegate from 'delegate-it';
import {CheckIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';

const reviewsFilterSelector = '#reviews-select-menu';

function addDropdownItem(dropdown: HTMLElement, title: string, filterCategory: string, filterValue: string): void {
	const filterQuery = `${filterCategory}:${filterValue}`;

	const searchParameter = new URLSearchParams(location.search);
	const currentQuerySegments = searchParameter.get('q')?.split(/\s+/) ?? [];
	const isSelected = currentQuerySegments.some(
		segment => segment.toLowerCase() === filterQuery
	);

	const query = currentQuerySegments.filter(
		segment => !segment.startsWith(`${filterCategory}:`)
	).join(' ');

	const search = new URLSearchParams({
		q: query + (isSelected ? '' : ` ${filterQuery}`)
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
		</a>
	);
}

const hasDraftFilter = new WeakSet();
function addDraftFilter({delegateTarget: reviewsFilter}: delegate.Event): void {
	if (hasDraftFilter.has(reviewsFilter)) {
		return;
	}

	hasDraftFilter.add(reviewsFilter);

	const dropdown = select('.SelectMenu-list', reviewsFilter)!;

	dropdown.append(
		<div className="SelectMenu-divider">
			Filter by draft pull requests
		</div>
	);

	addDropdownItem(dropdown, 'Ready for review', 'draft', 'false');
	addDropdownItem(dropdown, 'Not ready for review (Draft PR)', 'draft', 'true');
}

const hasChecks = cache.function(async (): Promise<boolean> => {
	const {repository} = await api.v4(`
		repository() {
			head: object(expression: "HEAD") {
				... on Commit {
					history(first: 10) {
						nodes {
							statusCheckRollup {
								state
							}
						}
					}
				}
			}
		}
	`);

	return repository.head.history.nodes.some((commit: AnyObject) => commit.statusCheckRollup);
}, {
	maxAge: {days: 3},
	cacheKey: () => __filebasename + ':' + getRepo()!.nameWithOwner
});

async function addChecksFilter(): Promise<void> {
	const reviewsFilter = await elementReady(reviewsFilterSelector);
	if (!reviewsFilter) {
		return;
	}

	if (!await hasChecks()) {
		return;
	}

	// Copy existing element and adapt its content
	const checksFilter = reviewsFilter.cloneNode(true);
	checksFilter.id = '';

	select('summary', checksFilter)!.firstChild!.textContent = 'Checks\u00A0'; // Only replace text node, keep caret
	select('.SelectMenu-title', checksFilter)!.textContent = 'Filter by checks status';

	const dropdown = select('.SelectMenu-list', checksFilter)!;
	dropdown.textContent = ''; // Drop previous filters

	for (const status of ['Success', 'Failure', 'Pending']) {
		addDropdownItem(dropdown, status, 'status', status.toLowerCase());
	}

	reviewsFilter.after(checksFilter);
}

async function init(): Promise<void> {
	delegate(document, reviewsFilterSelector, 'toggle', addDraftFilter, true);
	await addChecksFilter();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRList
	],
	awaitDomReady: false,
	init
});
