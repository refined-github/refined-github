import './select-notifications.css';

import React from 'dom-chef';
import {elementExists} from 'select-dom';
import {$, $$} from 'select-dom/strict.js';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import CheckCircleIcon from 'octicons-plain-react/CheckCircle';
import CheckIcon from 'octicons-plain-react/Check';
import DotFillIcon from 'octicons-plain-react/DotFill';
import DotIcon from 'octicons-plain-react/Dot';
import GitMergeIcon from 'octicons-plain-react/GitMerge';
import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
import SquirrelIcon from 'octicons-plain-react/Squirrel';
import XCircleIcon from 'octicons-plain-react/XCircle';

import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const prIcons = ':is(.octicon-git-pull-request, .octicon-git-pull-request-closed, .octicon-git-pull-request-draft, .octicon-git-merge)';
const issueIcons = ':is(.octicon-issue-opened, .octicon-issue-closed, .octicon-skip)';
const filters = {
	'Pull requests': prIcons,
	Issues: issueIcons,
	// This selector is a bit too loose, so it needs to be scoped to the smallest possible element and exclude the bookmark icon
	Others: `.notification-list-item-link .octicon:not(${prIcons}, ${issueIcons}, .octicon-bookmark)`,
	Open: ':is(.octicon-issue-opened, .octicon-git-pull-request)',
	Closed: ':is(.octicon-issue-closed, .octicon-git-pull-request-closed, .octicon-skip)',
	Draft: '.octicon-git-pull-request-draft',
	Merged: '.octicon-git-merge',
	Read: '.notification-read *',
	Unread: '.notification-unread *',
} as const;

type Filter = keyof typeof filters;
type Category = 'Type' | 'Status' | 'Read';

function resetFilters({target}: React.SyntheticEvent): void {
	$('form#rgh-select-notifications-form').reset();
	for (const label of $$('label', target as Element)) {
		label.setAttribute('aria-checked', 'false');
	}
}

function getFiltersSelector(formData: FormData, category: Category): string[] {
	return formData.getAll(category).map(value => filters[value as Filter]);
}

function handleSelection(): void {
	// @ts-expect-error TS bug
	const formData = new FormData($('form#rgh-select-notifications-form'));
	const types = getFiltersSelector(formData, 'Type');
	const statuses = getFiltersSelector(formData, 'Status');
	const readStatus = getFiltersSelector(formData, 'Read');
	const selectorGroups = [types, statuses, readStatus].filter(selectors => selectors.length > 0);
	const deselectAll = selectorGroups.length === 0;

	const notifications = $$('.notifications-list-item');
	let input: HTMLInputElement;
	for (const notification of notifications) {
		input = $('input.js-notification-bulk-action-check-item', notification);
		// Updating the "checked" property does not raise any events
		input.checked = !deselectAll && selectorGroups.every(selectors => elementExists(selectors, notification));
	}

	// Trigger the selection action bar update
	// @ts-expect-error input will be assigned in the loop above
	input.dispatchEvent(new Event('change', {bubbles: true}));
}

function createDropdownList(category: Category, filters: Filter[]): JSX.Element {
	const icons: Record<Filter, JSX.Element> = {
		'Pull requests': <GitPullRequestIcon className="color-fg-muted" />,
		Issues: <IssueOpenedIcon className="color-fg-muted" />,
		Open: <CheckCircleIcon className="color-fg-success" />,
		Others: <SquirrelIcon className="color-fg-muted" />,
		Closed: <XCircleIcon className="color-fg-danger" />,
		Draft: <GitPullRequestDraftIcon className="color-fg-subtle" />,
		Merged: <GitMergeIcon className="color-fg-done" />,
		Read: <DotIcon className="color-fg-accent" />,
		Unread: <DotFillIcon className="color-fg-accent" />,
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
				>
					<CheckIcon className="octicon octicon-check SelectMenu-icon SelectMenu-icon--check mr-2" aria-hidden="true" />
					<div className="SelectMenu-item-text">
						<input
							hidden
							type="checkbox"
							name={category}
							value={filter}
						/>
						{icons[filter]}
						<span className="ml-2">{filter}</span>
					</div>
				</label>
			))}
		</div>
	);
}

const createDropdown = onetime(() => (
	<details
		className="details-reset details-overlay position-relative rgh-select-notifications mr-2"
		onToggle={resetFilters}
	>
		<summary
			className="h6" // `h6` matches "Select all" style
			data-hotkey="Shift+S"
			aria-haspopup="menu"
			// Don't use tooltipped, it remains visible when the dropdown is open
			title="Hotkey: Shift+S"
			role="button"
		>
			Select by <span className="dropdown-caret ml-1" />
		</summary>
		<details-menu
			className="SelectMenu left-0"
			aria-label="Select by"
			role="menu"
			on-details-menu-selected={handleSelection}
		>
			<div className="SelectMenu-modal">
				<form id="rgh-select-notifications-form">
					{createDropdownList('Type', ['Pull requests', 'Issues', 'Others'])}
					{createDropdownList('Status', ['Open', 'Closed', 'Merged', 'Draft'])}
					{createDropdownList('Read', ['Read', 'Unread'])}
				</form>
			</div>
		</details-menu>
	</details>
));

function closeDropdown(): void {
	$('.rgh-select-notifications').removeAttribute('open');
}

function addDropdown(selectAllCheckbox: HTMLInputElement): void {
	selectAllCheckbox.style.verticalAlign = '-0.2em'; // #7852
	selectAllCheckbox.closest('label')!.after(
		// `h6` matches "Select all" style
		<span className="mx-2 h6">·</span>,
		createDropdown(),
	);
}

function init(signal: AbortSignal): void {
	observe('input.js-notifications-mark-all-prompt', addDropdown, {signal});

	// Close the dropdown when one of the toolbar buttons is clicked
	delegate(['.js-notifications-mark-selected-actions > *', '.rgh-open-selected-button'], 'click', closeDropdown, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		'shift s': 'Open the "Select by" dropdown',
	},
	include: [
		pageDetect.isNotifications,
	],
	init,
});

/*

Test URLs:

https://github.com/notifications (Grouped by date)
https://github.com/notifications (Grouped by repo)
https://github.com/notifications?query=reason%3Acomment (which is an unsaved filter)

*/
