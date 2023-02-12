import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer';
import features from '../feature-manager';

function addHeatIndex(timeAgo: HTMLElement): void {
	// `datetime` attribute used by pre-React version
	const diff = Date.now() - new Date(timeAgo.getAttribute('datetime') ?? timeAgo.title).getTime();

	// Create heat square root curve
	timeAgo.setAttribute(
		'data-rgh-heat',
		String(Math.round(Math.max(0, Math.min(10, Math.sqrt(diff / 400_000_000))))),
	);
}

function init(signal: AbortSignal): void {
	observe([
		'.js-navigation-item relative-time', // TODO: Drop old view in mid 2023
		'.react-directory-commit-age > [title]',
	], addHeatIndex, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	awaitDomReady: false,
	init,
});
