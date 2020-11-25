import 'webext-base-css/webext-base.css';
import './options.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import domify from 'doma';
import select from 'select-dom';
import delegate from 'delegate-it';
import fitTextarea from 'fit-textarea';
import * as indentTextarea from 'indent-textarea';

import LoadingIcon from './github-helpers/icon-loading';
import {perDomainOptions} from './options-storage';

async function getHeaders(personalToken: string): Promise<string> {
	const {headers} = await fetch('https://api.github.com/', {
		headers: {
			'User-Agent': 'Refined GitHub',
			Accept: 'application/vnd.github.v3+json',
			Authorization: `token ${personalToken}`
		}
	});

	return headers.get('X-OAuth-Scopes')!;
}

async function validateToken(): Promise<void> {
	const personalToken = select<HTMLInputElement>('[name="personalToken"]')!.value;
	console.log(personalToken);
	if (personalToken.length === 0) {
		for (const scope of select.all('span[data-scope]')) {
			scope.replaceWith(<span data-scope={scope.dataset.scope}/>);
		}

		return;
	}

	for (const scope of select.all('[data-scope]')) {
		scope.replaceWith(<LoadingIcon data-scope={scope.dataset.scope} width={12}/>);
	}

	const headers = (await getHeaders(personalToken)).split(', ');
	if (headers.includes('repo')) {
		headers.push('public_repo');
	}

	console.log(headers);
	for (const scope of select.all('[data-scope]')) {
		if (headers.includes(scope.dataset.scope!)) {
			scope.replaceWith(<span data-scope={scope.dataset.scope}>✔️</span>);
		} else {
			scope.replaceWith(<span data-scope={scope.dataset.scope}>❌</span>);
		}
	}
}

function moveDisabledFeaturesToTop(): void {
	const container = select('.js-features')!;
	for (const unchecked of select.all('.feature [type=checkbox]:not(:checked)', container).reverse()) {
		// .reverse() needed to preserve alphabetical order while prepending
		container.prepend(unchecked.closest('.feature')!);
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
					<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${id}.tsx`}>
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

async function generateDom(): Promise<void> {
	// Generate list
	select('.js-features')!.append(...__featuresMeta__.map(buildFeatureCheckbox));

	// Update list from saved options
	await perDomainOptions.syncForm('form');

	// Decorate list
	moveDisabledFeaturesToTop();
	void highlightNewFeatures();

	void validateToken();
	// Move debugging tools higher when side-loaded
	if (process.env.NODE_ENV === 'development') {
		select('#debugging-position')!.replaceWith(select('#debugging')!);
	}
}

function addEventListeners(): void {
	// Update domain-dependent page content when the domain is changed
	select('.js-options-sync-selector')?.addEventListener('change', ({currentTarget: dropdown}) => {
		select<HTMLAnchorElement>('#personal-token-link')!.host = (dropdown as HTMLSelectElement).value;
		void validateToken();
		console.log(' i ran');
	});

	// Refresh page when permissions are changed (because the dropdown selector needs to be regenerated)
	browser.permissions.onRemoved.addListener(() => location.reload());
	browser.permissions.onAdded.addListener(() => location.reload());

	// Improve textareas editing
	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');

	// Filter feature list
	select('#filter-features')!.addEventListener('input', featuresFilterHandler);

	// Add cache clearer
	select('#clear-cache')!.addEventListener('click', clearCacheHandler);
	select('#clear-cachee')!.addEventListener('click', validateToken);

	// Ensure all links open in a new tab #3181
	delegate(document, '[href^="http"]', 'click', (event: delegate.Event<MouseEvent, HTMLAnchorElement>) => {
		event.preventDefault();
		window.open(event.delegateTarget.href);
	});
}

async function init(): Promise<void> {
	await generateDom();
	addEventListeners();
}

void init();
