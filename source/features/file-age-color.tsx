import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {createHeatIndexFunction} from '../helpers/math.js';

const calculateHeatIndex = createHeatIndexFunction([0, -2_000_000_000]);

function addHeatIndex(lastUpdateElement: HTMLElement): void {
	// `datetime` attribute used by pre-React version
	const lastUpdate = new Date(lastUpdateElement.getAttribute('datetime') ?? lastUpdateElement.title);
	const diff = Date.now() - lastUpdate.getTime();

	lastUpdateElement.setAttribute('data-rgh-heat', String(calculateHeatIndex(-diff)));
}

function init(signal: AbortSignal): void {
	observe([
		'#files ~ div .js-navigation-item relative-time', // TODO: Drop old view in 2024
		'.react-directory-commit-age > [title]',
	], addHeatIndex, {signal});
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
