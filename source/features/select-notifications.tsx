import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {
	CheckCircleIcon,
	CheckIcon,
	DotFillIcon,
	DotIcon,
	GitMergeIcon,
	GitPullRequestDraftIcon,
	GitPullRequestIcon,
	IssueOpenedIcon,
	XCircleIcon
} from '@primer/octicons-react';

import features from '.';

const filters = {
	'Pull requests': ':is(.octicon-git-pull-request, .octicon-git-pull-request-closed, .octicon-git-pull-request-draft, .octicon-git-merge)',
	Issues: ':is(.octicon-issue-opened, .octicon-issue-closed)',
	Open: ':is(.octicon-issue-opened, .octicon-git-pull-request)',
	Closed: ':is(.octicon-issue-closed, .octicon-git-pull-request-closed)',
	Draft: '.octicon-git-pull-request-draft',
	Merged: '.octicon-git-merge',
	Read: '.notification-read',
	Unread: '.notification-unread'
};

type Filter = keyof typeof filters;
type Category = 'Type' | 'Status' | 'Read';

function selectNotification(notification: Element, state: boolean): void {
	const checkbox = select('input[type="checkbox"]', notification)!;
	if (checkbox.checked !== state) {
		// We can't set the `checked` property directly because it doesn't update the "Select all" count
		checkbox.dispatchEvent(new MouseEvent('click'));
	}
}

function resetFilters({target}: Event): void {
	for (const checkbox of select.all('input[type="checkbox"]:checked', target as Element)) {
		checkbox.checked = false;
		checkbox.parentElement!.parentElement!.setAttribute('aria-checked', 'false');
	}
}

function handleSelection({target}: Event): void {
	const selectedFilters = select.all('[aria-checked="true"]', target as Element);
	if (selectedFilters.length === 0) {
		for (const notification of select.all('.notifications-list-item')) {
			selectNotification(notification, false);
		}

		return;
	}

	const activeFilters: Record<Category, string[]> = {
		Type: [],
		Status: [],
		Read: []
	};
	for (const selectedFilter of selectedFilters) {
		activeFilters[selectedFilter.dataset.category as Category].push(filters[selectedFilter.dataset.filter as Filter]);
	}

	for (const notification of select.all('.notifications-list-item')) {
		let isNotificationSelected = true;
		for (const [category, categoryFilters] of Object.entries(activeFilters)) {
			if (category === 'Read') {
				if (categoryFilters.length === 1 && !notification.matches(categoryFilters[0])) {
					isNotificationSelected = false;
					break;
				}

				continue;
			}

			if (categoryFilters.length > 0 && !select.exists(categoryFilters, notification)) {
				isNotificationSelected = false;
				break;
			}
		}

		selectNotification(notification, isNotificationSelected);
	}
}

function createDropdownList(category: Category, filters: Filter[]): JSX.Element {
	const icons: {[Key in Filter]: JSX.Element} = {
		'Pull requests': <GitPullRequestIcon className="color-text-secondary"/>,
		Issues: <IssueOpenedIcon className="color-text-secondary"/>,
		Open: <CheckCircleIcon className="color-text-success"/>,
		Closed: <XCircleIcon className="color-text-danger"/>,
		Draft: <GitPullRequestDraftIcon className="color-text-tertiary"/>,
		Merged: <GitMergeIcon className="text-purple"/>,
		Read: <DotIcon className="color-text-link"/>,
		Unread: <DotFillIcon className="color-text-link"/>
	};

	return (
		<div className="SelectMenu-list">
			<header className="SelectMenu-header">
				<span className="SelectMenu-title">{category}</span>
			</header>
			{filters.map(filter => (
				<label
					className="SelectMenu-item text-normal"
					role="menuitemcheckbox"
					aria-checked="false"
					tabIndex={0}
					data-filter={filter}
					data-category={category}
				>
					<CheckIcon className="octicon octicon-check SelectMenu-icon SelectMenu-icon--check mr-2" aria-hidden="true"/>
					<div className="SelectMenu-item-text">
						<input hidden type="checkbox"/>
						{icons[filter]}
						<span className="ml-2">{filter}</span>
					</div>
				</label>
			))}
		</div>
	);
}

function createDropdown(): JSX.Element {
	return (
		<details
			className="details-reset details-overlay position-relative"
			on-toggle={resetFilters}
		>
			<summary
				className="btn btn-sm ml-3 mr-1"
				data-hotkey="S"
				aria-haspopup="menu"
				role="button"
			>
				Select by <span className="dropdown-caret ml-1"/>
			</summary>
			<details-menu
				className="SelectMenu left-0"
				aria-label="Select by"
				role="menu"
				on-details-menu-selected={handleSelection}
			>
				<div className="SelectMenu-modal">
					{createDropdownList('Type', ['Pull requests', 'Issues'])}
					{createDropdownList('Status', ['Open', 'Closed', 'Merged', 'Draft'])}
					{createDropdownList('Read', ['Read', 'Unread'])}
				</div>
			</details-menu>
		</details>
	);
}

function init(): false | void {
	select('.js-notifications-mark-all-prompt')!
		.closest('label')!
		.after(createDropdown());
}

void features.add(__filebasename, {
	shortcuts: {
		S: 'Open the "Select by" dropdown'
	},
	include: [
		pageDetect.isNotifications
	],
	init
});
