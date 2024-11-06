import 'webext-base-css/webext-base.css';
import './options.css';
import {$, $optional} from 'select-dom/strict.js';
import {$$} from 'select-dom';
import fitTextarea from 'fit-textarea';
import prettyBytes from 'pretty-bytes';
import {enableTabToIndent} from 'indent-textarea';
import delegate, {type DelegateEvent} from 'delegate-it';
import {isChrome, isFirefox} from 'webext-detect';
import type {SyncedForm} from 'webext-options-sync-per-domain';

import './helpers/target-blank-polyfill.js';
import clearCacheHandler from './helpers/clear-cache-handler.js';
import {styleHotfixes} from './helpers/hotfix.js';
import {importedFeatures} from './feature-data.js';
import getStorageBytesInUse from './helpers/used-storage.js';
import {perDomainOptions} from './options-storage.js';
import isDevelopmentVersion from './helpers/is-development-version.js';
import {doesBrowserActionOpenOptions} from './helpers/feature-utils.js';
import {state as bisectState} from './helpers/bisect.js';
import initFeatureList, {updateListDom} from './options/feature-list.js';
import initTokenValidation from './options/token-validation.js';

const supportsFieldSizing = CSS.supports('field-sizing', 'content');

let syncedForm: SyncedForm | undefined;

const {version} = chrome.runtime.getManifest();

async function updateStorageUsage(area: 'sync' | 'local'): Promise<void> {
	const storage = chrome.storage[area];
	const used = await getStorageBytesInUse(area);
	const available = storage.QUOTA_BYTES - used;
	for (const output of $$(`.storage-${area}`)) {
		output.textContent = available < 1000
			? 'FULL!'
			: available < 100_000
				? `Only ${prettyBytes(available)} available`
				: `${prettyBytes(used)} used`;
	}
}

async function findFeatureHandler(this: HTMLButtonElement): Promise<void> {
	// TODO: Add support for GHE
	const options = await perDomainOptions.getOptionsForOrigin().getAll();
	const enabledFeatures = importedFeatures.filter(featureId => options['feature:' + featureId]);
	await bisectState.set(enabledFeatures);

	this.disabled = true;
	setTimeout(() => {
		this.disabled = false;
	}, 10_000);

	$('#find-feature-message').hidden = false;
}

function focusFirstField({delegateTarget: section}: DelegateEvent<Event, HTMLDetailsElement>): void {
	if (section.getBoundingClientRect().bottom > window.innerHeight) {
		section.scrollIntoView({behavior: 'smooth', block: 'nearest'});
	}

	if (section.open) {
		const field = $optional('input, textarea', section);
		if (field) {
			field.focus({preventScroll: true});
			if (!supportsFieldSizing && field instanceof HTMLTextAreaElement) {
				// #6404
				fitTextarea(field);
			}
		}
	}
}

function updateRateLink(): void {
	if (isChrome()) {
		return;
	}

	$('a#rate-link').href = isFirefox() ? 'https://addons.mozilla.org/en-US/firefox/addon/refined-github-' : 'https://apps.apple.com/app/id1519867270?action=write-review';
}

function isEnterprise(): boolean {
	return syncedForm!.getSelectedDomain() !== 'default';
}

async function showStoredCssHotfixes(): Promise<void> {
	const cachedCSS = await styleHotfixes.getCached(version);
	$('#hotfixes-field').textContent
		= isDevelopmentVersion()
			? 'Hotfixes are not applied in the development version.'
			: isEnterprise()
				? 'Hotfixes are not applied on GitHub Enterprise.'
				: cachedCSS ?? 'No CSS found in cache.';
}

function enableToggleAll(this: HTMLButtonElement): void {
	this.parentElement!.remove();
	for (const ui of $$('.toggle-all-features')) {
		ui.hidden = false;
	}
}

function disableAllFeatures(): void {
	for (const enabledFeature of $$('.feature-checkbox:checked')) {
		enabledFeature.click();
	}

	$('details#features').open = true;
}

function enableAllFeatures(): void {
	for (const disabledFeature of $$('.feature-checkbox:not(:checked)')) {
		disabledFeature.click();
	}

	$('details#features').open = true;
}

async function generateDom(): Promise<void> {
	// Generate list
	await initFeatureList();

	// Update list from saved options
	syncedForm = await perDomainOptions.syncForm('form');

	// Decorate list
	updateListDom();

	// Only now the form is ready, we can show it
	$('#js-failed').remove();

	// Enable token validation
	void initTokenValidation(syncedForm);

	// Update rate link if necessary
	updateRateLink();

	// Update storage usage info
	void updateStorageUsage('local');
	void updateStorageUsage('sync');

	// Hide non-applicable "Button link" section
	if (doesBrowserActionOpenOptions) {
		$('#action').hidden = true;
	}

	// Show stored CSS hotfixes
	void showStoredCssHotfixes();

	$('#version').textContent = version;
}

function addEventListeners(): void {
	// Update domain-dependent page content when the domain is changed
	syncedForm?.onChange(async domain => {
		// Point the link to the right domain
		$('a#personal-token-link').host = domain === 'default' ? 'github.com' : domain;

		// Delay to let options load first
		setTimeout(updateListDom, 100);
	});

	// Refresh page when permissions are changed (because the dropdown selector needs to be regenerated)
	chrome.permissions.onRemoved.addListener(() => {
		location.reload();
	});
	chrome.permissions.onAdded.addListener(() => {
		location.reload();
	});

	// Update storage usage info
	chrome.storage.onChanged.addListener((_, areaName) => {
		void updateStorageUsage(areaName as 'sync' | 'local');
	});

	// Improve textareas editing
	enableTabToIndent('textarea');
	if (!supportsFieldSizing) {
		fitTextarea.watch('textarea');
	}

	// Automatically focus field when a section is toggled open
	delegate('details', 'toggle', focusFirstField, {capture: true});

	// Add cache clearer
	$('#clear-cache').addEventListener('click', clearCacheHandler);

	// Add bisect tool
	$('#find-feature').addEventListener('click', findFeatureHandler);

	// Handle "Toggle all" buttons
	$('#toggle-all-features').addEventListener('click', enableToggleAll);
	$('#disable-all-features').addEventListener('click', disableAllFeatures);
	$('#enable-all-features').addEventListener('click', enableAllFeatures);
}

async function init(): Promise<void> {
	await generateDom();
	addEventListeners();
}

void init();
