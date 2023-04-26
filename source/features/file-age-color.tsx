import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer';
import features from '../feature-manager';
import {createHeatIndexFunction} from '../helpers/math';

const calculateHeatIndex = createHeatIndexFunction([0, -2_000_000_000]);

function addHeatIndex(lastUpdateElement: HTMLElement): void {
	// `datetime` attribute used by pre-React version
	const lastUpdate = new Date(lastUpdateElement.getAttribute('datetime') ?? lastUpdateElement.title);
	const diff = Date.now() - lastUpdate.getTime();

	lastUpdateElement.setAttribute('data-rgh-heat', String(calculateHeatIndex(-diff)));
}

function init(signal: AbortSignal): void {
	observe([
		'#files ~ div .js-navigation-item relative-time', // TODO: Drop old view in mid 2023
		'.react-directory-commit-age > [title]',
	], addHeatIndex, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	init,
});
