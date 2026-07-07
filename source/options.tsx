import 'webext-base-css/webext-base.css';
import './options.css';
import {enableTabToIndent} from 'indent-textarea';
import {$, $$} from 'select-dom';
import type {SyncedForm} from 'webext-options-sync-per-domain';
import 'webext-bugs/target-blank';
import elementReady from 'element-ready';
import {assertDefined} from 'ts-extras';

import clearCacheHandler from './helpers/clear-cache-handler.js';
import {perDomainOptions} from './options-storage.js';
import initToggleAllButtons from './options/toggle-all.js';

function moveDisabledFeaturesToTop(): void {
	const container = $('.js-features');
	const features = $$('feature-item').toSorted((a, b) => a.dataset.text!.localeCompare(b.dataset.text!));
	const grouped = Object.groupBy(features, feature => {
		const checkbox = $('input.feature-checkbox', feature);
		return checkbox.checked ? 'on' : checkbox.disabled ? 'broken' : 'off';
	});

	for (const group of [grouped.off, grouped.broken, grouped.on]) {
		if (group) {
			for (const feature of group) {
				container.append(feature);
			}
		}
	}
}

function updateListDom(): void {
	moveDisabledFeaturesToTop();

	// Notify <feature-count> that the DOM state has updated
	globalThis.dispatchEvent(new CustomEvent('rgh:update-count'));
}

function informComponentOfExternalUpdate(field: HTMLInputElement | HTMLTextAreaElement): void {
	field.dispatchEvent(new InputEvent('input', {bubbles: true}));
}

async function generateDom(): Promise<SyncedForm> {
	const element = await elementReady('.js-features', {
		stopOnDomReady: false,
		signal: AbortSignal.timeout(500),
	});

	assertDefined(element);

	// Update list from saved options
	const syncedForm = await perDomainOptions.syncForm('form');

	// <token-input> runs before the value is set, so it detects `firstRun` to avoid validation on an empty form.
	// This triggers a proper run
	for (const tokenField of $$('token-input input')) {
		informComponentOfExternalUpdate(tokenField);
	}

	// Decorate list
	updateListDom();
	initToggleAllButtons();

	// JS loaded, remove message before it appears
	$('#js-failed').remove();

	return syncedForm;
}

function addEventListeners(syncedForm: SyncedForm): void {
	// Update domain-dependent page content when the domain is changed
	syncedForm.onChange(async domain => {
		const host = domain === 'default' ? 'github.com' : domain;

		// Point the link to the right domain
		$('a#personal-token-link').host = host;

		// Hot fixes are not used on GHE
		$('hot-fixes').toggleAttribute('enterprise', domain !== 'default');

		// Hide "Button link" on GHE domains https://github.com/refined-github/refined-github/issues/7704
		$('action-link').toggleAttribute('enterprise', domain !== 'default');

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

	// Add cache clearer
	$('#clear-cache').addEventListener('click', clearCacheHandler);
}

async function init(): Promise<void> {
	const syncedForm = await generateDom();
	addEventListeners(syncedForm);
}

await init();
