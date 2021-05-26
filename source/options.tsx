import 'webext-base-css/webext-base.css';
import './options.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import domify from 'doma';
import select from 'select-dom';
import delegate from 'delegate-it';
import fitTextarea from 'fit-textarea';
import compareVersions from 'tiny-version-compare';
import * as indentTextarea from 'indent-textarea';

import {perDomainOptions} from './options-storage';
import getRghIssueUrl from './helpers/get-rgh-issue-url';

interface Status {
	error?: true;
	text?: string;
	scopes?: string[];
}

// Don't repeat the magic variable, or its content will be inlined multiple times
const features = __featuresMeta__;

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
	const url = tokenLink.host === 'github.com' ?
		'https://api.github.com/' :
		`${tokenLink.origin}/api/v3/`;

	const response = await fetch(url, {
		cache: 'no-store',
		headers: {
			'User-Agent': 'Refined GitHub',
			Accept: 'application/vnd.github.v3+json',
			Authorization: `token ${personalToken}`
		}
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
			scopes: await getTokenScopes(tokenField.value)
		});
	} catch (error: unknown) {
		reportStatus({error: true, text: (error as Error).message});
		throw error;
	}
}

function moveNewAndDisabledFeaturesToTop(): void {
	const container = select('.js-features')!;

	for (const unchecked of select.all('.feature [type=checkbox]:not(:checked)', container).reverse()) {
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
			<input type="checkbox" name={`feature:${id}`} id={id}/>
			<div className="info">
				<label htmlFor={id}>
					<span className="feature-name">{id}</span>
					{' '}
					<a href={`https://github.com/sindresorhus/refined-github/blob/main/source/features/${id}.tsx`}>
						source
					</a>
					{screenshot && <>, <a href={screenshot}>screenshot</a></>}
					{descriptionElement}
				</label>
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
	await cache.set<FeatureID[]>('bisect', features.map(({id}) => id), {minutes: 5});

	const button = event.target as HTMLButtonElement;
	button.disabled = true;
	setTimeout(() => {
		button.disabled = false;
	}, 10_000);

	select('#find-feature-message')!.hidden = false;
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

	for (const feature of select.all('.feature [type=checkbox]')) {
		if (!(feature.id in featuresAlreadySeen)) {
			featuresAlreadySeen[feature.id] = isFirstVisit ? tenDaysAgo : Date.now();
		}

		if (featuresAlreadySeen[feature.id] > tenDaysAgo) {
			feature.parentElement!.classList.add('feature-new');
		}
	}

	void browser.storage.local.set({featuresAlreadySeen});
}

async function getFeaturesDisabledViaHotfix(): Promise<HTMLElement[]> {
	const {version} = browser.runtime.getManifest();
	if (version === '0.0.0') {
		return [];
	}

	const hotfixes = await cache.get<string[][]>('hotfixes');
	if (!hotfixes) {
		return [];
	}

	const disabledFeatures = [];
	for (const [feature, unaffectedVersion, relatedIssue] of hotfixes) {
		if (features.some(({id}) => id === feature) && (!unaffectedVersion || compareVersions(unaffectedVersion, version) > 0)) {
			disabledFeatures.push(
				<p>
					<code>{feature}</code> has been temporarily disabled
					{relatedIssue ? <> due to <a href={getRghIssueUrl(relatedIssue)}>#{relatedIssue}</a></> : false}.
				</p>
			);
		}
	}

	return disabledFeatures;
}

async function generateDom(): Promise<void> {
	// Generate list
	select('.js-features')!.append(...features.map(buildFeatureCheckbox));

	// Add notices for features disabled via hotfix
	select('.js-hotfixes')!.append(...await getFeaturesDisabledViaHotfix());

	// Update list from saved options
	await perDomainOptions.syncForm('form');

	// Decorate list
	await highlightNewFeatures();
	moveNewAndDisabledFeaturesToTop();
	void validateToken();

	// Move debugging tools higher when side-loaded
	if (process.env.NODE_ENV === 'development') {
		select('#debugging-position')!.replaceWith(select('#debugging')!);
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
		event.preventDefault();
		window.open(event.delegateTarget.href);
	});
}

async function init(): Promise<void> {
	await generateDom();
	addEventListeners();
}

void init();
