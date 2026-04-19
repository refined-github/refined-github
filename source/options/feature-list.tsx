import React from 'dom-chef';
import domify from 'doma';
import delegate, {type DelegateEvent} from 'delegate-it';
import {$} from 'select-dom/strict.js';
import {$$, countElements} from 'select-dom';

import {getLocalHotfixes} from '../helpers/hotfix.js';
import {createRghIssueLink, getFeatureUrl} from '../helpers/rgh-links.js';
import {importedFeatures, featuresMeta} from '../feature-data.js';

function moveDisabledFeaturesToTop(): void {
	const container = $('.js-features');
	const features = $$('.feature').toSorted((a, b) => a.dataset.text!.localeCompare(b.dataset.text!));
	const grouped = Object.groupBy(features, feature => {
		const checkbox = $('input.feature-checkbox', feature);
		return checkbox.checked ? 'on' : checkbox.disabled ? 'broken' : 'off';
	});
	for (const group of [grouped.off, grouped.broken, grouped.on].filter(Boolean)) {
		for (const feature of group!) {
			container.append(feature);
		}
	}
}

async function markLocalHotfixes(): Promise<void> {
	for (const [feature, relatedIssue] of await getLocalHotfixes()) {
		if (importedFeatures.includes(feature)) {
			const input = $<HTMLInputElement>('#' + feature);
			input.disabled = true;
			input.removeAttribute('name');
			$(`.feature-name[for="${feature}"]`).after(
				<span className="hotfix-notice"> (Disabled due to {createRghIssueLink(relatedIssue)})</span>,
			);
		}
	}
}

function buildFeatureCheckbox({id, description, screenshot}: FeatureMeta): HTMLElement {
	return (
		<div className="feature" data-text={`${id} ${description}`.toLowerCase()}>
			<input type="checkbox" name={`feature:${id}`} id={id} className="feature-checkbox" />
			<div className="info">
				<label className="feature-name" htmlFor={id}>{id}</label>
				{' '}
				<a href={getFeatureUrl(id)} className="feature-link">
					source
				</a>
				<input hidden type="checkbox" className="screenshot-toggle" />
				{screenshot && (
					<a href={screenshot} className="screenshot-link">
						screenshot
					</a>
				)}
				<p className="description">{domify(description)}</p>
				{screenshot && (
					<img hidden src={screenshot} loading="lazy" className="screenshot" />
				)}
			</div>
		</div>
	);
}

function summaryHandler(event: DelegateEvent<MouseEvent>): void {
	if (event.ctrlKey || event.metaKey || event.shiftKey) {
		return;
	}

	event.preventDefault();
	if (event.altKey) {
		for (const toggle of $$('input.screenshot-toggle')) {
			toggle.checked = !toggle.checked;
		}
	} else {
		const toggle = event
			.delegateTarget
			.closest('.feature')!
			.querySelector('input.screenshot-toggle')!;
		toggle.checked = !toggle.checked;
	}
}

function featuresFilterHandler(this: HTMLInputElement): void {
	const keywords = this
		.value
		.toLowerCase()
		.replaceAll(/\W/g, ' ')
		.split(/\s+/)
		.filter(Boolean); // Ignore empty strings
	for (const feature of $$('.feature')) {
		feature.hidden = !keywords.every(word => feature.dataset.text!.includes(word));
	}
}

const offCount = new Text();

function updateOffCount(): void {
	const count = countElements('.feature-checkbox:not(:checked)');
	switch (count) {
		case 0: {
			offCount.nodeValue = '';
			break;
		}

		case countElements('.feature-checkbox'): {
			offCount.nodeValue = '(JS off… are you breaking up with me?)';
			break;
		}

		default: {
			offCount.nodeValue = `(${count} off)`;
		}
	}
}

export default async function initFeatureList(): Promise<void> {
	// Generate list
	$('.js-features').append(...featuresMeta
		.filter(feature => importedFeatures.includes(feature.id))
		.map(feature => buildFeatureCheckbox(feature)),
	);

	// Add notice for features disabled via hotfix
	await markLocalHotfixes();

	// Load screenshots
	delegate('.screenshot-link', 'click', summaryHandler);

	// Filter feature list
	$('input#filter-features').addEventListener('input', featuresFilterHandler);

	// Add feature count. CSS-only features are added approximately
	$('.features-header').append(`: ${featuresMeta.length + 25} `, offCount);

	delegate('.feature-checkbox', 'change', updateOffCount);
}

export function updateListDom(): void {
	moveDisabledFeaturesToTop();
	updateOffCount();
}
