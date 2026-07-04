import 'webext-base-css/webext-base.css';
import './options.css';
import delegate, {type DelegateEvent} from 'delegate-it';
import {enableTabToIndent} from 'indent-textarea';
import {$, $$, $optional, closestElementOptional, elementExists} from 'select-dom';
import type {SyncedForm} from 'webext-options-sync-per-domain';
import 'webext-bugs/target-blank';

import {messageRuntime} from 'webext-msg';

import clearCacheHandler from './helpers/clear-cache-handler.js';
import {doesBrowserActionOpenOptions} from './helpers/feature-utils.js';
import {perDomainOptions} from './options-storage.js';
import initFeatureList, {updateListDom} from './options/feature-list.js';
import initToggleAllButtons from './options/toggle-all.js';

let syncedForm: SyncedForm | undefined;
let hasScrolledToTarget = false;

function informComponentOfExternalUpdate(field: HTMLInputElement | HTMLTextAreaElement): void {
	field.dispatchEvent(new InputEvent('input', {bubbles: true}));
}

function focusSection({delegateTarget: section}: DelegateEvent<Event, HTMLDetailsElement>): void {
	if (!hasScrolledToTarget && elementExists(':target')) {
		return;
	}

	const rect = section.getBoundingClientRect();
	if (rect.bottom > window.innerHeight || rect.top < 0) {
		section.scrollIntoView({behavior: 'smooth', block: 'nearest'});
	}

	if (section.open) {
		const field = $optional('input, textarea', section);
		if (field) {
			field.focus({preventScroll: true});
		}
	}
}

async function validateBackgroundPage(): Promise<void> {
	if (await messageRuntime({ping: true}) !== 'pong') {
		$('.js-background-fail-banner').hidden = false;
	}
}

async function generateDom(): Promise<void> {
	// Generate list
	await initFeatureList();

	// Update list from saved options
	syncedForm = await perDomainOptions.syncForm('form');

	// <token-input> runs before the value is set, so it detects `firstRun` to avoid validation on an empty form.
	// This triggers a proper run
	for (const tokenField of $$('token-input input')) {
		informComponentOfExternalUpdate(tokenField);
	}

	// Decorate list
	updateListDom();
	initToggleAllButtons();

	// Only now the form is ready, we can show it
	$('#js-failed').remove();

	// Hide non-applicable "Button link" section
	if (doesBrowserActionOpenOptions) {
		$('#action').hidden = true;
	}

	void validateBackgroundPage();
}

function addEventListeners(): void {
	// Update domain-dependent page content when the domain is changed
	syncedForm?.onChange(async domain => {
		const host = domain === 'default' ? 'github.com' : domain;
		// Point the link to the right domain
		$('a#personal-token-link').host = host;

		// Hot fixes are not used on GHE
		$('hot-fixes').toggleAttribute('enterprise', domain !== 'default');

		// Hide "Button link" on GHE domains https://github.com/refined-github/refined-github/issues/7704
		$('#action').hidden = domain !== 'default' || !doesBrowserActionOpenOptions;

		for (const element of $$('storage-usage[item]')) {
			element.setAttribute('item', domain === 'default' ? 'options' : 'options:' + domain);
		}

		for (const element of $$('token-input')) {
			element.setAttribute('host', host);
			informComponentOfExternalUpdate($('input', element));
		}

		updateListDom();
	});

	// Refresh page when permissions are changed (because the dropdown selector needs to be regenerated)
	chrome.permissions.onRemoved.addListener(() => {
		location.reload();
	});
	chrome.permissions.onAdded.addListener(() => {
		location.reload();
	});

	// Improve textareas editing
	enableTabToIndent('textarea');

	// Bring section into view when opened
	delegate('details', 'toggle', focusSection, {capture: true});

	// Add cache clearer
	$('#clear-cache').addEventListener('click', clearCacheHandler);
}

function scrollTargetIntoView(): void {
	const {hash} = location;
	if (!hash) {
		return;
	}

	const element = $optional(hash);
	if (!element) {
		return;
	}

	const details = closestElementOptional('details', element);
	if (details) {
		details.open = true;
	}

	element.scrollIntoView({
		block: 'start',
	});

	hasScrolledToTarget = true;
}

async function init(): Promise<void> {
	await generateDom();
	addEventListeners();
	scrollTargetIntoView();
}

await init();
