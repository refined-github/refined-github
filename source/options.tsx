import 'webext-base-css/webext-base.css';
import './options.css';
import {expectElement as $, $$} from 'select-dom';
import fitTextarea from 'fit-textarea';
import prettyBytes from 'pretty-bytes';
import {assertError} from 'ts-extras';
import {enableTabToIndent} from 'indent-textarea';
import delegate, {DelegateEvent} from 'delegate-it';
import {isChrome, isFirefox} from 'webext-detect';
import {SyncedForm} from 'webext-options-sync-per-domain';

import clearCacheHandler from './helpers/clear-cache-handler.js';
import {styleHotfixes} from './helpers/hotfix.js';
import {importedFeatures} from './feature-data.js';
import getStorageBytesInUse from './helpers/used-storage.js';
import {perDomainOptions} from './options-storage.js';
import isDevelopmentVersion from './helpers/is-development-version.js';
import {doesBrowserActionOpenOptions} from './helpers/feature-utils.js';
import {state as bisectState} from './helpers/bisect.js';
import {parseTokenScopes} from './github-helpers/github-token.js';
import {scrollIntoViewIfNeeded} from './github-helpers/index.js';
import initFeatureList, {updateListDom} from './options/feature-list.js';

type TokenType = 'classic' | 'fine_grained';

let syncedForm: SyncedForm | undefined;

type Status = {
	tokenType: TokenType;
	error?: true;
	text?: string;
	scopes?: string[];
};

const {version} = chrome.runtime.getManifest();

function reportStatus({tokenType, error, text, scopes}: Status): void {
	const tokenStatus = $('#validation');
	tokenStatus.textContent = text ?? '';
	if (error) {
		tokenStatus.dataset.validation = 'invalid';
	} else {
		delete tokenStatus.dataset.validation;
	}

	// Toggle the ulists by token type (default to classic)
	for (const ulist of $$('[data-token-type]')) {
		ulist.style.display = ulist.dataset.tokenType === tokenType ? '' : 'none';
	}

	for (const scope of $$('[data-scope]')) {
		if (scopes) {
			scope.dataset.validation = scopes.includes(scope.dataset.scope!) ? 'valid' : 'invalid';
		} else {
			scope.dataset.validation = '';
		}
	}
}

function getApiUrl(): string {
	const tokenLink = $('a#personal-token-link');
	return tokenLink.host === 'github.com'
		? 'https://api.github.com'
		: `${tokenLink.origin}/api/v3`;
}

async function getNameFromToken(token: string): Promise<string> {
	const response = await fetch(
		getApiUrl() + '/user',
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	const details = await response.json();
	if (!response.ok) {
		throw new Error(details.message);
	}

	return details.login;
}

async function getTokenScopes(personalToken: string): Promise<string[]> {
	const response = await fetch(getApiUrl(), {
		cache: 'no-store',
		headers: {
			'User-Agent': 'Refined GitHub',
			'Accept': 'application/vnd.github.v3+json',
			'Authorization': `token ${personalToken}`,
		},
	});

	if (!response.ok) {
		const details = await response.json();
		throw new Error(details.message);
	}

	return parseTokenScopes(response.headers);
}

function expandTokenSection(): void {
	$('details#token').open = true;
}

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

async function validateToken(): Promise<void> {
	const tokenField = $('input[name="personalToken"]');
	const tokenType = tokenField.value.startsWith('github_pat_') ? 'fine_grained' : 'classic';
	reportStatus({tokenType});

	if (!tokenField.validity.valid || tokenField.value.length === 0) {
	// The Chrome options iframe auto-sizer causes the "scrollIntoView" function to scroll incorrectly unless you wait a bit
	// https://github.com/refined-github/refined-github/issues/6807
		setTimeout(expandTokenSection, 100);
		return;
	}

	reportStatus({text: 'Validating…', tokenType});

	try {
		const [scopes, user] = await Promise.all([
			getTokenScopes(tokenField.value),
			getNameFromToken(tokenField.value),
		]);
		reportStatus({
			tokenType,
			text: `👤 @${user}`,
			scopes,
		});
	} catch (error) {
		assertError(error);
		reportStatus({tokenType, error: true, text: error.message});
		expandTokenSection();
		throw error;
	}
}

async function findFeatureHandler(event: Event): Promise<void> {
	// TODO: Add support for GHE
	const options = await perDomainOptions.getOptionsForOrigin().getAll();
	const enabledFeatures = importedFeatures.filter(featureId => options['feature:' + featureId]);
	await bisectState.set(enabledFeatures);

	const button = event.target as HTMLButtonElement;
	button.disabled = true;
	setTimeout(() => {
		button.disabled = false;
	}, 10_000);

	$('#find-feature-message').hidden = false;
}

function focusFirstField({delegateTarget: section}: DelegateEvent<Event, HTMLDetailsElement>): void {
	scrollIntoViewIfNeeded(section);
	if (section.open) {
		const field = $('input, textarea', section);
		if (field) {
			field.focus();
			if (field instanceof HTMLTextAreaElement) {
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

function enableToggleAll({currentTarget: button}: Event): void {
	(button as HTMLButtonElement).parentElement!.remove();
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
	void validateToken();

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

	$('#version')!.textContent = version;
}

function addEventListeners(): void {
	// Update domain-dependent page content when the domain is changed
	syncedForm?.onChange(async domain => {
		$('a#personal-token-link').host = domain === 'default' ? 'github.com' : domain;
		// Delay to let options load first
		setTimeout(() => {
			validateToken();

			// Re-sort list
			updateListDom();
		}, 100);
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
	fitTextarea.watch('textarea');
	enableTabToIndent('textarea');

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

	// Add token validation
	$('[name="personalToken"]').addEventListener('input', validateToken);
}

async function init(): Promise<void> {
	await generateDom();
	addEventListeners();
}

void init();
