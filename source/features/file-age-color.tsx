/*

This feature is documented at https://github.com/refined-github/refined-github/wiki/Customization

*/

import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import { createHeatIndexFunction } from '../helpers/math.js';
import observe from '../helpers/selector-observer.js';

const calculateHeatIndex = createHeatIndexFunction([0, -2_000_000_000]);
const month = 30 * 24 * 60 * 60 * 1000;

function addHeatIndex(lastUpdateElement: HTMLElement): void {
	// `datetime` attribute used by pre-React version
	const lastUpdate = new Date(lastUpdateElement.getAttribute('datetime') ?? lastUpdateElement.title);
	const diff = Date.now() - lastUpdate.getTime();

	// Dim files older than 4 months; dimmer after 12
	if (diff > 4 * month) {
		lastUpdateElement.style.opacity = diff > 12 * month ? '0.6' : '0.8';
		return;
	}

	lastUpdateElement.setAttribute('data-rgh-heat', String(calculateHeatIndex(-diff)));
}

function init(signal: AbortSignal): void {
	observe('.react-directory-commit-age > [title]', addHeatIndex, { signal });
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/tree/main/source

*/
