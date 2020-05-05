import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import cache from 'webext-storage-cache';
import CheckIcon from 'octicon/check.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import * as api from '../libs/api';
import {getRepoGQL, getRepoURL} from '../libs/utils';

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
		repository(${getRepoGQL()}) {
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
	maxAge: 3,
	cacheKey: () => __filebasename + ':' + getRepoURL()
});

async function addChecksFilter(): Promise<void> {
	const reviewsFilter = select(reviewsFilterSelector);
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

function init(): void {
	delegate(document, reviewsFilterSelector, 'toggle', addDraftFilter, true);
	addChecksFilter();
}

features.add({
	id: __filebasename,
	description: 'Adds Checks and Draft PR dropdown filters in PR lists.',
	screenshot: 'https://user-images.githubusercontent.com/202916/74453250-6d9de200-4e82-11ea-8fd4-7c0de57e001a.png'
}, {
	include: [
		pageDetect.isPRList
	],
	init
});
