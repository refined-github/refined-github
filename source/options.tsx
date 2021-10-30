import React from 'dom-chef';
import cache from 'webext-storage-cache';
import domify from 'doma';
import select from 'select-dom';
import delegate from 'delegate-it';
import fitTextarea from 'fit-textarea';
import * as indentTextarea from 'indent-textarea';

import {getLocalHotfixes} from './helpers/hotfix';
import {perDomainOptions} from './options-storage';
import {createRghIssueLink} from './helpers/rgh-issue-link';

interface Status {
	error?: true;
	text?: string;
	scopes?: string[];
}

// Don't repeat the magic variable, or its content will be inlined multiple times
const features = __featuresMeta__;
const featureList = features.map(({id}) => id);
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

	return scopes;
}

async function validateToken(): Promise<void> {
	reportStatus({});
	const tokenField = select('input[name="personalToken"]')!;
	if (!tokenField.validity.valid || tokenField.value.length === 0) {
		return;
	}

	reportStatus({text: 'Validating…'});

	try {
		reportStatus({
			scopes: await getTokenScopes(tokenField.value),
		});
	} catch (error: unknown) {
		reportStatus({error: true, text: (error as Error).message});
		throw error;
	}
}

function moveNewAndDisabledFeaturesToTop(): void {
	const container = select('.js-features')!;

	for (const unchecked of select.all('.feature-checkbox:not(:checked)', container).reverse()) {
		// .reverse() needed to preserve alphabetical order while prepending
		container.prepend(unchecked.closest('.feature')!);
	}

	for (const newFeature of select.all('.feature-new', container).reverse()) {
		// .reverse() needed to preserve alphabetical order while prepending
		container.prepend(newFeature);
	}
}

function buildFeatureCheckbox({id, description, screenshot}: FeatureMeta): HTMLElement {
	const descriptionElement = domify.one(description)!;
	descriptionElement.className = 'description';

	return (
		<div className="feature" data-text={`${id} ${description}`.toLowerCase()}>
			<input type="checkbox" name={`feature:${id}`} id={id} className="feature-checkbox"/>
			<div className="info">
				<label className="feature-name" htmlFor={id}>{id}</label>
				{' '}
				<a href={`https://github.com/refined-github/refined-github/blob/main/source/features/${id}.tsx`} className="feature-link">
					source
				</a>
				<input hidden type="checkbox" className="screenshot-toggle"/>
				{screenshot && (
					<a href={screenshot} className="screenshot-link">
						screenshot
					</a>
				)}
				{descriptionElement}
				{screenshot && (
					<img hidden data-src={screenshot} className="screenshot"/>
				)}
			</div>
		</div>
	);
}

async function clearCacheHandler(event: Event): Promise<void> {
	await cache.clear();
	const button = event.target as HTMLButtonElement;
	const initialText = button.textContent;
	button.textContent = 'Cache cleared!';
	button.disabled = true;
	setTimeout(() => {
		button.textContent = initialText;
		button.disabled = false;
	}, 2000);
}

async function findFeatureHandler(event: Event): Promise<void> {
	await cache.set<FeatureID[]>('bisect', featureList, {minutes: 5});

	const button = event.target as HTMLButtonElement;
	button.disabled = true;
	setTimeout(() => {
		button.disabled = false;
	}, 10_000);

	select('#find-feature-message')!.hidden = false;
}

function summaryHandler(event: delegate.Event<MouseEvent>): void {
	if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
		return;
	}

	event.preventDefault();
	const feature = event.delegateTarget.parentElement!;

	// Toggle checkbox
	const toggle = feature.querySelector('input.screenshot-toggle')!;
	toggle.checked = !toggle.checked;

	// Lazy-load image
	const screenshot = feature.querySelector('img.screenshot')!;
	screenshot.src = screenshot.dataset.src!;
}

function featuresFilterHandler(event: Event): void {
	const keywords = (event.currentTarget as HTMLInputElement).value.toLowerCase()
		.replace(/\W/g, ' ')
		.split(/\s+/)
		.filter(Boolean); // Ignore empty strings
	for (const feature of select.all('.feature')) {
		feature.hidden = !keywords.every(word => feature.dataset.text!.includes(word));
	}
}

async function highlightNewFeatures(): Promise<void> {
	const {featuresAlreadySeen} = await browser.storage.local.get({featuresAlreadySeen: {}});
	const isFirstVisit = Object.keys(featuresAlreadySeen).length === 0;
	const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);

	for (const feature of select.all('.feature-checkbox')) {
		if (!(feature.id in featuresAlreadySeen)) {
			featuresAlreadySeen[feature.id] = isFirstVisit ? tenDaysAgo : Date.now();
		}

		if (featuresAlreadySeen[feature.id] > tenDaysAgo) {
			feature.parentElement!.classList.add('feature-new');
		}
	}

	void browser.storage.local.set({featuresAlreadySeen});
}

async function getLocalHotfixesAsNotice(): Promise<HTMLElement> {
	const disabledFeatures = <div className="js-hotfixes"/>;

	for (const [feature,, relatedIssue] of await getLocalHotfixes(version)) {
		if (featureList.includes(feature)) {
			disabledFeatures.append(
				<p><code>{feature}</code> has been temporarily disabled due to {createRghIssueLink(relatedIssue)}.</p>,
			);
		}
	}

	return disabledFeatures;
}

async function generateDom(): Promise<void> {
	// Generate list
	select('.js-features')!.append(...features.map(feature => buildFeatureCheckbox(feature)));

	// Add notice for features disabled via hotfix
	select('.js-features')!.before(await getLocalHotfixesAsNotice());

	// Update list from saved options
	await perDomainOptions.syncForm('form');

	// Decorate list
	await highlightNewFeatures();
	moveNewAndDisabledFeaturesToTop();
	void validateToken();

	// Move debugging tools higher when side-loaded
	if (process.env.NODE_ENV === 'development') {
		select('#debugging-position')!.replaceWith(select('#debugging')!);
		select('#logHTTP-line')!.hidden = false;
	}

	// Add feature count. CSS-only features are added approximately
	select('.features-header')!.append(` (${features.length + 25})`);
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

	// Improve textareas editing
	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');

	// Load screenshots
	delegate(document, '.screenshot-link', 'click', summaryHandler);

	// Filter feature list
	select('#filter-features')!.addEventListener('input', featuresFilterHandler);

	// Add cache clearer
	select('#clear-cache')!.addEventListener('click', clearCacheHandler);

	// Add bisect tool
	select('#find-feature')!.addEventListener('click', findFeatureHandler);

	// Add token validation
	select('[name="personalToken"]')!.addEventListener('input', validateToken);

	// Ensure all links open in a new tab #3181
	delegate(document, 'a[href^="http"]', 'click', event => {
		if (!event.defaultPrevented) {
			event.preventDefault();
			window.open(event.delegateTarget.href);
		}
	});
}

async function init(): Promise<void> {
	await generateDom();
	addEventListeners();
}

void init();
