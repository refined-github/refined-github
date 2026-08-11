import 'webext-base-css/webext-base.css';
import './options.css';

// eslint-disable-next-line import-x/no-unassigned-import -- custom component
import './options.svelte';

// eslint-disable-next-line import-x/no-unassigned-import -- Side effects
import 'webext-bugs/target-blank';

import {enableTabToIndent} from 'indent-textarea';
import {$, $$} from 'select-dom';
import elementReady from 'element-ready';
import {assertDefined} from 'ts-extras';

import clearCacheHandler from './helpers/clear-cache-handler.js';
import {perDomainOptions} from './options-storage.js';
import initToggleAllButtons from './options/toggle-all.js';

function sortFeatures(): void {
	const container = $('.js-features');
	const features = $$('.feature-item').toSorted((a, b) => a.dataset.text!.localeCompare(b.dataset.text!));
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
	sortFeatures();

	// Notify <feature-count> that the DOM state has updated
	globalThis.dispatchEvent(new CustomEvent('rgh:update-count'));
}

assertDefined(
	await elementReady('.js-features', {
		stopOnDomReady: false,
		signal: AbortSignal.timeout(1000),
	}),
);
assertDefined(
	await elementReady('[data-token-input-manager][data-ready="true"]', {
		stopOnDomReady: false,
		signal: AbortSignal.timeout(1000),
	}),
);

// Update list from saved options
const syncedForm = await perDomainOptions.syncForm('form');

// Decorate list
updateListDom();
initToggleAllButtons();

// JS loaded, remove message before it appears
$('#js-failed').remove();

// Update domain-dependent page content when the domain is changed
syncedForm.onChange(async domain => {
	const host = domain === 'default' ? 'github.com' : domain;

	// Point the link to the right domain
	$('a#personal-token-link').host = host;

	$('rgh-options').domain = domain;

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
