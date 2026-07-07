import delegate from 'delegate-it';
import elementReady from 'element-ready';
import {$, $$, countElements} from 'select-dom';
import {assertDefined} from 'ts-extras';

import {featuresMeta} from '../feature-data.js';

function moveDisabledFeaturesToTop(): void {
	const container = $('.js-features');
	const features = $$('feature-item').toSorted((a, b) => a.dataset.text!.localeCompare(b.dataset.text!));
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
	const element = await elementReady('.js-features', {
		stopOnDomReady: false,
		signal: AbortSignal.timeout(500),
	});

	assertDefined(element);

	// Add feature count. CSS-only features are added approximately
	$('.features-header').append(`: ${featuresMeta.length + 25} `, offCount);
	delegate('.feature-checkbox', 'change', updateOffCount);
}

export function updateListDom(): void {
	moveDisabledFeaturesToTop();
	updateOffCount();
}
