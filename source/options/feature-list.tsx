import React from 'dom-chef';
import domify from 'doma';
import delegate, {DelegateEvent} from 'delegate-it';
import {expectElement as $, $$, elementExists} from 'select-dom';

import {getLocalHotfixes} from '../helpers/hotfix.js';
import createRghIssueLink from '../helpers/rgh-issue-link.js';
import featureLink from '../helpers/feature-link.js';
import {importedFeatures, featuresMeta} from '../feature-data.js';

function moveDisabledFeaturesToTop(): void {
	const container = $('.js-features');
	const features = $$('.feature').toSorted((a, b) => a.dataset.text!.localeCompare(b.dataset.text!));
	const grouped = Object.groupBy(features, feature => elementExists(':checked', feature) ? 'enabled' : 'disabled');
	for (const group of [grouped.disabled, grouped.enabled]) {
		for (const feature of group!) {
			container.append(feature);
		}
	}
}

async function markLocalHotfixes(): Promise<void> {
	for (const [feature, relatedIssue] of await getLocalHotfixes()) {
		if (importedFeatures.includes(feature)) {
			const input = $<HTMLInputElement>('#' + feature)!;
			input.disabled = true;
			input.removeAttribute('name');
			$(`.feature-name[for="${feature}"]`)!.after(
				<span className="hotfix-notice"> (Disabled due to {createRghIssueLink(relatedIssue)})</span>,
			);
		}
	}
}

function buildFeatureCheckbox({id, description, screenshot}: FeatureMeta): HTMLElement {
	return (
		<div className="feature" data-text={`${id} ${description}`.toLowerCase()}>
			<div className="info">
				<input type="checkbox" name={`feature:${id}`} id={id} className="feature-checkbox" />
				<label className="feature-name" htmlFor={id}>{id}</label>
				{' '}
				<a href={featureLink(id)} className="feature-link">
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
		for (const screenshotLink of $$('.screenshot-link')) {
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
}

function featuresFilterHandler(event: Event): void {
	const keywords = (event.currentTarget as HTMLInputElement).value.toLowerCase()
		.replaceAll(/\W/g, ' ')
		.split(/\s+/)
		.filter(Boolean); // Ignore empty strings
	for (const feature of $$('.feature')) {
		feature.hidden = !keywords.every(word => feature.dataset.text!.includes(word));
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
	$('#filter-features')!.addEventListener('input', featuresFilterHandler);

	// Add feature count. CSS-only features are added approximately
	$('.features-header').append(` (${featuresMeta.length + 25})`);
}

export function updateListDom(): void {
	moveDisabledFeaturesToTop();
}
