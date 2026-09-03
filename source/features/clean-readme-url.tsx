import * as pageDetect from 'github-url-detection';
import {$optional} from 'select-dom';

import delay from '../helpers/delay.js';
import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';

const readmeTab = 'readme-ov-file';

function scrollToReadme(): void {
	// The asynchronously rendered link can be ready before the target
	$optional('#readme')?.scrollIntoView({behavior: 'instant'});
}

function scrollToReadmeOnClick(event: MouseEvent): void {
	if (event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
		scrollToReadme();
	}
}

function addReadmeTarget(target: HTMLElement): void {
	target.id = 'readme';
	if (location.hash === '#readme') {
		scrollToReadme();
	}
}

function addReadmeScrollFallback(link: HTMLAnchorElement, {signal}: SignalAsOptions): void {
	// This pseudo-fragment switches back from other overview tabs, so it must remain unchanged
	link.addEventListener('click', scrollToReadmeOnClick, {signal});
}

async function maybeCleanUrl(): Promise<void> {
	const parsed = new URL(location.href);
	// README is the default view; other overview tabs must keep their parameter
	if (parsed.searchParams.get('tab') !== readmeTab) {
		return;
	}

	// GitHub has some delayed logic to deal with this internally
	// https://github.com/refined-github/refined-github/issues/9908
	await delay(500);
	parsed.searchParams.delete('tab');
	history.replaceState(history.state, '', parsed.href);
	scrollToReadme();
}

function init(signal: AbortSignal): void {
	void maybeCleanUrl();

	// TODO [2027-01-01]: Only needed to avoid breaking on Safari <26.2 (<2026)
	navigation?.addEventListener('navigatesuccess', maybeCleanUrl, {signal});

	observe('nav[aria-label="Repository files"]', addReadmeTarget, {signal});
	observe(
		'[class*="SidebarSection-module__sidebarSection"] a[href="#readme-ov-file"]',
		addReadmeScrollFallback,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoHome,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github?tab=readme-ov-file
https://github.com/refined-github/refined-github?tab=MIT-1-ov-file
https://github.com/refined-github/refined-github#readme

*/
