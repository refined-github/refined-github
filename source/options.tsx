import 'webext-base-css/webext-base.css';
import './options.css';
import React from 'dom-chef';
import domify from 'doma';
import select from 'select-dom';
import fitTextarea from 'fit-textarea';
import prettyBytes from 'pretty-bytes';
import {assertError} from 'ts-extras';
import * as indentTextarea from 'indent-textarea';
import delegate, {DelegateEvent} from 'delegate-it';
import {isChrome, isFirefox} from 'webext-detect-page';
import {isEnterprise} from 'github-url-detection';

import featureLink from './helpers/feature-link.js';
import clearCacheHandler from './helpers/clear-cache-handler.js';
import {getLocalHotfixes, styleHotfixes} from './helpers/hotfix.js';
import {createRghIssueLink} from './helpers/rgh-issue-link.js';
import {importedFeatures, featuresMeta} from '../readme.md';
import getStorageBytesInUse from './helpers/used-storage.js';
import {perDomainOptions} from './options-storage.js';
import isDevelopmentVersion from './helpers/is-development-version.js';
import {doesBrowserActionOpenOptions} from './helpers/feature-utils.js';
import {state as bisectState} from './helpers/bisect.js';

type Status = {
	error?: true;
	text?: string;
	scopes?: string[];
};

const {version} = browser.runtime.getManifest();

function reportStatus({error, text, scopes}: Status): void {
	const tokenStatus = select('#validation')!;
	tokenStatus.textContent = text ?? '';
	if (error) {
		tokenStatus.dataset.validation = 'invalid';
	} else {
		delete tokenStatus.dataset.validation;
	}

	for (const scope of select.all('[data-scope]')) {
		if (scopes) {
			scope.dataset.validation = scopes.includes(scope.dataset.scope!) ? 'valid' : 'invalid';
		} else {
			scope.dataset.validation = '';
		}
	}
}

async function getTokenScopes(personalToken: string): Promise<string[]> {
	const tokenLink = select('a#personal-token-link')!;
	const url = tokenLink.host === 'github.com'
		? 'https://api.github.com/'
		: `${tokenLink.origin}/api/v3/`;

	const response = await fetch(url, {
		cache: 'no-store',
		headers: {
			'User-Agent': 'Refined GitHub',
			Accept: 'application/vnd.github.v3+json',
			Authorization: `token ${personalToken}`,
		},
	});

	if (!response.ok) {
		const details = await response.json();
		throw new Error(details.message);
	}

	const scopes = response.headers.get('X-OAuth-Scopes')!.split(', ');
	scopes.push('valid_token');
	if (scopes.includes('repo')) {
		scopes.push('public_repo');
	}

	if (scopes.includes('project')) {
		scopes.push('read:project');
	}

	return scopes;
}

function expandTokenSection(): void {
	select('details#token')!.open = true;
}

async function updateStorageUsage(area: 'sync' | 'local'): Promise<void> {
	const storage = browser.storage[area];
	const used = await getStorageBytesInUse(area);
	const available = storage.QUOTA_BYTES - used;
	for (const output of select.all(`.storage-${area}`)) {
		output.textContent = available < 1000
			? 'FULL!'
			: (available < 100_000
				? `Only ${prettyBytes(available)} available`
				: `${prettyBytes(used)} used`);
	}
}

async function validateToken(): Promise<void> {
	reportStatus({});
	const tokenField = select('input[name="personalToken"]')!;

	if (tokenField.value.startsWith('github_pat_')) {
		// Validation not supported yet https://github.com/refined-github/refined-github/issues/6092
		return;
	}

	if (!tokenField.validity.valid || tokenField.value.length === 0) {
	// The Chrome options iframe auto-sizer causes the "scrollIntoView" function to scroll incorrectly unless you wait a bit
	// https://github.com/refined-github/refined-github/issues/6807
		setTimeout(expandTokenSection, 100);
		return;
	}

	reportStatus({text: 'Validating…'});

	try {
		reportStatus({
			scopes: await getTokenScopes(tokenField.value),
		});
	} catch (error) {
		assertError(error);
		reportStatus({error: true, text: error.message});
		expandTokenSection();
		throw error;
	}
}

function moveDisabledFeaturesToTop(): void {
	const container = select('.js-features')!;

	for (const unchecked of select.all('.feature-checkbox:not(:checked)', container).reverse()) {
		// .reverse() needed to preserve alphabetical order while prepending
		container.prepend(unchecked.closest('.feature')!);
	}
}

function buildFeatureCheckbox({id, description, screenshot}: FeatureMeta): HTMLElement {
	return (
		<div className="feature" data-text={`${id} ${description}`.toLowerCase()}>
			<input type="checkbox" name={`feature:${id}`} id={id} className="feature-checkbox"/>
			<div className="info">
				<label className="feature-name" htmlFor={id}>{id}</label>
				{' '}
				<a href={featureLink(id)} className="feature-link">
					source
				</a>
				<input hidden type="checkbox" className="screenshot-toggle"/>
				{screenshot && (
					<a href={screenshot} className="screenshot-link">
						screenshot
					</a>
				)}
				<p className="description">{domify(description)}</p>
				{screenshot && (
					<img hidden data-src={screenshot} className="screenshot"/>
				)}
			</div>
		</div>
	);
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

	select('#find-feature-message')!.hidden = false;
}

function summaryHandler(event: DelegateEvent<MouseEvent>): void {
	if (event.ctrlKey || event.metaKey || event.shiftKey) {
		return;
	}

	event.preventDefault();
	if (event.altKey) {
		for (const screenshotLink of select.all('.screenshot-link')) {
			toggleScreenshot(screenshotLink.parentElement!);
		}
	} else {
		const feature = event.delegateTarget.parentElement!;
		toggleScreenshot(feature);
	}
}

function toggleScreenshot(feature: Element): void {
	const toggle = feature.querySelector('input.screenshot-toggle')!;
	toggle.checked = !toggle.checked;

	// Lazy-load image
	const screenshot = feature.querySelector('img.screenshot')!;
	screenshot.src = screenshot.dataset.src!;
}

function featuresFilterHandler(event: Event): void {
	const keywords = (event.currentTarget as HTMLInputElement).value.toLowerCase()
		.replaceAll(/\W/g, ' ')
		.split(/\s+/)
		.filter(Boolean); // Ignore empty strings
	for (const feature of select.all('.feature')) {
		feature.hidden = !keywords.every(word => feature.dataset.text!.includes(word));
	}
}

function focusFirstField({delegateTarget: section}: DelegateEvent<Event, HTMLDetailsElement>): void {
	// @ts-expect-error No Firefox support https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded
	(section.scrollIntoViewIfNeeded ?? section.scrollIntoView).call(section);
	if (section.open) {
		const field = select('input, textarea', section);
		if (field) {
			field.focus();
			if (field instanceof HTMLTextAreaElement) {
				// #6404
				fitTextarea(field);
			}
		}
	}
}

async function markLocalHotfixes(): Promise<void> {
	for (const [feature, relatedIssue] of await getLocalHotfixes()) {
		if (importedFeatures.includes(feature)) {
			const input = select<HTMLInputElement>('#' + feature)!;
			input.disabled = true;
			input.removeAttribute('name');
			select(`.feature-name[for="${feature}"]`)!.after(
				<span className="hotfix-notice"> (Disabled due to {createRghIssueLink(relatedIssue)})</span>,
			);
		}
	}
}

function updateRateLink(): void {
	if (isChrome()) {
		return;
	}

	select('a#rate-link')!.href = isFirefox() ? 'https://addons.mozilla.org/en-US/firefox/addon/refined-github-' : 'https://apps.apple.com/app/id1519867270?action=write-review';
}

async function showStoredCssHotfixes(): Promise<void> {
	const cachedCSS = await styleHotfixes.getCached(version);
	select('#hotfixes-field')!.textContent
		= isDevelopmentVersion()
			? 'Hotfixes are not applied in the development version.'
			: isEnterprise()
				? 'Hotfixes are not applied on GitHub Enterprise.'
				: cachedCSS ?? 'No CSS found in cache.';
}

async function generateDom(): Promise<void> {
	// Generate list
	select('.js-features')!.append(...featuresMeta
		.filter(feature => importedFeatures.includes(feature.id))
		.map(feature => buildFeatureCheckbox(feature)),
	);

	// Add notice for features disabled via hotfix
	await markLocalHotfixes();

	// Update list from saved options
	await perDomainOptions.syncForm('form');

	// Decorate list
	moveDisabledFeaturesToTop();

	// Enable token validation
	void validateToken();

	// Add feature count. CSS-only features are added approximately
	select('.features-header')!.append(` (${featuresMeta.length + 25})`);

	// Update rate link if necessary
	updateRateLink();

	// Update storage usage info
	void updateStorageUsage('local');
	void updateStorageUsage('sync');

	// Hide non-applicable "Button link" section
	if (doesBrowserActionOpenOptions) {
		select('#action')!.hidden = true;
	}

	// Show stored CSS hotfixes
	void showStoredCssHotfixes();
}

function addEventListeners(): void {
	// Update domain-dependent page content when the domain is changed
	select('.OptionsSyncPerDomain-picker select')?.addEventListener('change', ({currentTarget: dropdown}) => {
		const host = (dropdown as HTMLSelectElement).value;
		select('a#personal-token-link')!.host = host === 'default' ? 'github.com' : host;
		// Delay validating to let options load first
		setTimeout(validateToken, 100);
	});

	// Refresh page when permissions are changed (because the dropdown selector needs to be regenerated)
	browser.permissions.onRemoved.addListener(() => {
		location.reload();
	});
	browser.permissions.onAdded.addListener(() => {
		location.reload();
	});

	// Update storage usage info
	browser.storage.onChanged.addListener((_, areaName) => {
		void updateStorageUsage(areaName as 'sync' | 'local');
	});

	// Improve textareas editing
	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');

	// Load screenshots
	delegate('.screenshot-link', 'click', summaryHandler);

	// Automatically focus field when a section is toggled open
	delegate('details', 'toggle', focusFirstField, {capture: true});

	// Filter feature list
	select('#filter-features')!.addEventListener('input', featuresFilterHandler);

	// Add cache clearer
	select('#clear-cache')!.addEventListener('click', clearCacheHandler);

	// Add bisect tool
	select('#find-feature')!.addEventListener('click', findFeatureHandler);

	// Add token validation
	select('[name="personalToken"]')!.addEventListener('input', validateToken);
}

async function init(): Promise<void> {
	await generateDom();
	addEventListeners();

	// TODO: Storage cleanup #6421, Drop in June 2023
	void browser.storage.local.remove('featuresAlreadySeen');
}

void init();
