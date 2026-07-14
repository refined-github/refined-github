import * as pageDetect from 'github-url-detection';
import {$, $$, closestElement, elementExists} from 'select-dom';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import {botLinksNotificationSelectors} from '../github-helpers/selectors.js';
import {is, not} from '../helpers/css-selectors.js';
import observe from '../helpers/selector-observer.js';
import SelectNotifications from './select-notifications.svelte';

const prIcons = [
	'.octicon-git-pull-request',
	'.octicon-git-pull-request-closed',
	'.octicon-git-pull-request-draft',
	'.octicon-git-merge',
] as const;
export const issueIcons = [
	'.octicon-issue-opened',
	'.octicon-issue-closed',
	'.octicon-skip',
] as const;
const filters = {
	'Pull requests': is(prIcons),
	Issues: is(issueIcons),
	// This selector is a bit too loose, so it needs to be scoped to the smallest possible element and exclude the bookmark icon
	Others: '.notification-list-item-link .octicon' + not(...prIcons, ...issueIcons, '.octicon-bookmark'),
	Bots: is(botLinksNotificationSelectors),
	Open: ':is(.octicon-issue-opened, .octicon-git-pull-request)',
	Closed: ':is(.octicon-issue-closed, .octicon-git-pull-request-closed, .octicon-skip)',
	Draft: '.octicon-git-pull-request-draft',
	Merged: '.octicon-git-merge',
	Read: '.notification-read *',
	Unread: '.notification-unread *',
} as const;

export type Filter = keyof typeof filters;
export type Category = 'Type' | 'Status' | 'Read';
export type Selection = Record<Category, Filter[]>;

const categories: Record<Category, Filter[]> = {
	Type: ['Pull requests', 'Issues', 'Others', 'Bots'],
	Status: ['Open', 'Closed', 'Merged', 'Draft'],
	Read: ['Read', 'Unread'],
};

function selectMatching(selection: Selection): void {
	const selectorGroups = Object.values(selection)
		.map(names => names.map(name => filters[name]))
		.filter(selectors => selectors.length > 0);
	const shouldDeselectAll = selectorGroups.length === 0;

	let input: HTMLInputElement | undefined;
	for (const notification of $$('.notifications-list-item')) {
		input = $('input.js-notification-bulk-action-check-item', notification);
		// Updating the "checked" property does not raise any events
		input.checked = !shouldDeselectAll && selectorGroups.every(selectors => elementExists(selectors, notification));
	}

	// Trigger the selection action bar update
	input?.dispatchEvent(new Event('change', {bubbles: true}));
}

function addDropdown(selectAllCheckbox: HTMLInputElement): void {
	const anchor = closestElement('label', selectAllCheckbox);

	mount(SelectNotifications, {
		target: anchor.parentElement!,
		anchor: anchor.nextElementSibling!,
		props: {categories, onSelectionChange: selectMatching},
	});
}

function init(signal: AbortSignal): void {
	observe('input.js-notifications-mark-all-prompt', addDropdown, {signal});
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
