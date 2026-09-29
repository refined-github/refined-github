import './filter-jobs-by-status.css';

import {onAbort} from 'abort-utils';
import batchedFunction from 'batched-function';
import * as pageDetect from 'github-url-detection';
import {$, $$optional, $optional, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const filteringClass = 'rgh-job-status-filtering';
const matchClass = 'rgh-job-status-match';

const filterButton = '[class^="ActionsRunJobsList-module__jobsHeader"] button:has(.octicon-filter)';
const headingSelector = '[class^="ActionsRunJobsList-module__jobsHeading"]';
const jobLink = 'nav[aria-label="Workflow run"] a[data-test-selector="job-link"]';
const jobIcon = `${jobLink} [data-component="ActionList.LeadingVisual"] svg`;
const menuItem = '[role="menuitemradio"]';

// We can only figure out a job's status in the sidebar by looking at its icon or aria label.
// The keys are the labels of the native menu icons.
const iconByLabel: Readonly<Record<string, string>> = {
	Queued: '.octicon-dot-fill',
	'In progress': '[aria-label="Currently running"]',
	'Action required': '.octicon-bell',
	Successful: '.octicon-check-circle-fill',
	Failed: '.octicon-x-circle-fill',
	Cancelled: '.octicon-stop',
	Skipped: '.octicon-skip',
	'Timed out': '.octicon-alert',
};

function getItemLabel(item: HTMLElement): string {
	return $('[data-component="ActionList.Item.Label"]', item).textContent;
}

function getJobLabel(job: HTMLElement): string | undefined {
	const icon = $('[data-component="ActionList.LeadingVisual"]', job);
	// If github adds a new status we don't know about, we'll return `undefined`.
	return Object.keys(iconByLabel).find(label => $optional(iconByLabel[label], icon));
}

// Store excluded statuses. By default, this is empty (default ALL filter)
function getExcluded(): Set<string> {
	const stored = document.body.dataset.rghJobStatuses ?? '';
	return new Set(stored.split('|').filter(Boolean));
}

function getTitle(excluded: ReadonlySet<string>): string {
	const checked = Object.keys(iconByLabel).filter(label => !excluded.has(label));
	if (excluded.size === 0) {
		return 'All jobs';
	}

	if (checked.length === 0) {
		return 'No jobs';
	}

	const excludedString = `All jobs except ${[...excluded].join(', ')}`;
	const includedString = `${checked.join(', ')} jobs`;
	// We render whatever label is shorter
	return excludedString.length > includedString.length ? includedString : excludedString;
}

function isStatusMenuItem(item: HTMLElement): boolean {
	const button = $optional(filterButton);
	const menu = closestElementOptional('[role="menu"]', item);
	// If it's not rendered yet, skip it.
	return Boolean(button && menu) && menu!.getAttribute('aria-labelledby') === button!.getAttribute('aria-labelledby');
}

function getStatusItem(target: Event['target']): HTMLElement | undefined {
	const item = target instanceof Element ? closestElementOptional(menuItem, target) : undefined;
	return item && isStatusMenuItem(item) ? item : undefined;
}

function refresh(): void {
	const excluded = getExcluded();

	for (const job of $$optional(jobLink)) {
		const label = getJobLabel(job);
		// If we can't tell what status a job is, never filter it, so we don't hide one we can't show again.
		job.classList.toggle(matchClass, !label || !excluded.has(label));
	}

	document.body.classList.toggle(filteringClass, excluded.size > 0);

	// We have to write the heading ourselves since we're eating the events React would normally use
	const heading = $optional(headingSelector);
	const title = getTitle(excluded);
	if (heading && heading.textContent !== title) {
		heading.textContent = title;
	}

	for (const item of $$optional(menuItem)) {
		if (!isStatusMenuItem(item)) {
			continue;
		}

		const label = getItemLabel(item);
		item.setAttribute('aria-checked', String(label === 'All' ? excluded.size === 0 : !excluded.has(label)));
	}
}

function toggleItem(item: HTMLElement): void {
	const label = getItemLabel(item);
	const excluded = getExcluded();

	if (label === 'All') {
		// Uncheck everything if it's already checked, otherwise check everything.
		// Treat it like a "select all" checkbox
		const wasAllChecked = excluded.size === 0;
		excluded.clear();
		if (wasAllChecked) {
			for (const status of Object.keys(iconByLabel)) {
				excluded.add(status);
			}
		}
	} else if (Object.hasOwn(iconByLabel, label) && !excluded.delete(label)) {
		excluded.add(label);
	}

	document.body.dataset.rghJobStatuses = [...excluded].join('|');
	refresh();
}

// The GitHub filter menu closes on pick. We want to keep it open for multi-select.
function handlePick(event: Event): void {
	const item = getStatusItem(event.target);
	if (!item) {
		return;
	}

	event.preventDefault();
	event.stopImmediatePropagation();

	if (event.type === 'click' || event.type === 'keydown') {
		toggleItem(item);
	}
}

function handleKey(event: KeyboardEvent): void {
	if (event.key === 'Enter' || event.key === ' ') {
		handlePick(event);
	}
}

function init(signal: AbortSignal): void {
	// Navigating to another run should clear our filters
	onAbort(signal, () => {
		document.body.classList.remove(filteringClass);
		delete document.body.dataset.rghJobStatuses;
		refresh();
	});

	// Run our handlers before React's handlers
	document.addEventListener('click', handlePick, {capture: true, signal});
	for (const type of ['keydown', 'keypress', 'keyup'] as const) {
		document.addEventListener(type, handleKey, {capture: true, signal});
	}

	// Any time we get an update from GitHub, we need to re-filter
	observe(jobIcon, batchedFunction(refresh, {delay: 100}), {signal});

	// Github's React code builds the menu items on every open.
	// We need to throw our own checkmarks in there.
	// The menu doesn't have a `focusin` when you open it with the mouse, and in Firefox, I never saw a `selector-observer` fire
	// So we have to use a MutationObserver :(
	// eslint-disable-next-line byo/no-mutation-observer -- Can't find any other way to trigger this
	const menuObserver = new MutationObserver(batchedFunction(refresh, {delay: 0}));
	menuObserver.observe(document.body, {childList: true, subtree: true});
	onAbort(signal, () => {
		menuObserver.disconnect();
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isActionRun,
	],
	init,
});

/*

Test URLs

lots of working and failed jobs, open the filter menu and pick e.g. Skipped
https://github.com/NousResearch/hermes-agent/actions/runs/36593454803

*/
