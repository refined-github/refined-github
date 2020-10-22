import 'webext-base-css/webext-base.css';
import './options.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import delegate from 'delegate-it';
import fitTextarea from 'fit-textarea';
import {applyToLink} from 'shorten-repo-url';
import * as indentTextarea from 'indent-textarea';

import getTextNodes from './helpers/get-text-nodes';
import {perDomainOptions} from './options-storage';
import * as domFormatters from './github-helpers/dom-formatters';

export function parseSimpleInlineElement(element: Element, tag: string): void {
	const splittingRegex = new RegExp(`<${tag}>(.+?)</${tag}>`, 'g');

	for (const node of getTextNodes(element)) {
		const fragment = new DocumentFragment();
		for (const [index, text] of node.textContent!.split(splittingRegex).entries()) {
			if (index % 2 && text.length >= 1) {
				const createdElement = document.createElement(tag);
				createdElement.textContent = text.trim();
				fragment.append(createdElement);
			} else if (text.length > 0) {
				fragment.append(text);
			}
		}

		if (fragment.children.length > 0) {
			node.replaceWith(fragment);
		}
	}
}

function parseDescription(description: string): DocumentFragment {
	const descriptionElement = <span>{description}</span>;
	domFormatters.linkifyIssues(descriptionElement, {
		baseUrl: 'https://github.com',
		user: 'sindresorhus',
		repository: 'refined-github'
	});
	domFormatters.linkifyURLs(descriptionElement);
	domFormatters.parseBackticks(descriptionElement);
	parseSimpleInlineElement(descriptionElement, 'i');
	parseSimpleInlineElement(descriptionElement, 'kbd');

	for (const a of select.all('a', descriptionElement)) {
		applyToLink(a);
	}

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{[...descriptionElement.childNodes]}</>;
}

function moveDisabledFeaturesToTop(): void {
	const container = select('.js-features')!;
	for (const unchecked of select.all('.feature--enabled [type=checkbox]:not(:checked)', container).reverse()) {
		// .reverse() needed to preserve alphabetical order while prepending
		container.prepend(unchecked.closest('.feature')!);
	}
}

function buildFeatureCheckbox({id, description, screenshot, disabled}: FeatureMeta): HTMLElement {
	// `undefined` disconnects it from the options
	const key = disabled ? undefined : `feature:${id}`;

	return (
		<div className={`feature feature--${disabled ? 'disabled' : 'enabled'}`} data-text={`${id} ${description}`.toLowerCase()}>
			<input type="checkbox" name={key} id={id} disabled={Boolean(disabled)}/>
			<div className="info">
				<label htmlFor={id}>
					<span className="feature-name">{id}</span>
					{' '}
					{disabled && <small>{parseDescription(`(Disabled because of ${disabled}) `)}</small>}
					<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${id}.tsx`}>
						source
					</a>
					{screenshot && <>, <a href={screenshot}>screenshot</a></>}
					<p className="description">{parseDescription(description)}</p>
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

	// Move debugging tools higher when side-loaded
	if (process.env.NODE_ENV === 'development') {
		select('#debugging-position')!.replaceWith(select('#debugging')!);
	}
}

function addEventListeners(): void {
	// Update domain-dependent page content when the domain is changed
	select('.js-options-sync-selector')?.addEventListener('change', ({currentTarget: dropdown}) => {
		select<HTMLAnchorElement>('#personal-token-link')!.host = (dropdown as HTMLSelectElement).value;
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
