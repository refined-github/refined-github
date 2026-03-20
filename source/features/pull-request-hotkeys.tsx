import {$$, $optional} from 'select-dom/strict.js';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';

const tabnavSelector = [
	'[aria-label="Pull request tabs"]',
	'[aria-label="Pull request navigation tabs"]', // Commits list tab
].join(', ');
const tabSelector = [
	'a.tabnav-tab',
	'a[role="tab"]', // Commits list tab
].join(', ');
const chordTimeout = 1500;

function getTabs(): HTMLAnchorElement[] {
	const tabnav = $optional(tabnavSelector);
	return tabnav ? $$(tabSelector, tabnav) : [];
}

function getSelectedIndex(tabs: HTMLAnchorElement[]): number {
	return tabs.findIndex(tab =>
		tab.classList.contains('selected')
		|| tab.getAttribute('aria-current') === 'page'
		|| tab.getAttribute('aria-selected') === 'true',
	);
}

function getTargetTab(code: string): HTMLAnchorElement | undefined {
	const tabs = getTabs();
	if (tabs.length === 0) {
		return;
	}

	const selectedIndex = Math.max(getSelectedIndex(tabs), 0);
	if (code === 'ArrowLeft') {
		return tabs[(selectedIndex - 1 + tabs.length) % tabs.length];
	}

	if (code === 'ArrowRight') {
		return tabs[(selectedIndex + 1) % tabs.length];
	}

	if (/^Digit[1-9]$/.test(code)) {
		return tabs[Number(code.slice(-1)) - 1];
	}

	return undefined;
}

async function init(signal: AbortSignal): Promise<void> {
	await elementReady(tabnavSelector);

	let awaitingChord = false;
	let resetChordTimer: ReturnType<typeof setTimeout> | undefined;

	const clearChord = (): void => {
		awaitingChord = false;
		clearTimeout(resetChordTimer);
		resetChordTimer = undefined;
	};

	const startChord = (): void => {
		clearChord();
		awaitingChord = true;
		resetChordTimer = setTimeout(clearChord, chordTimeout);
	};

	const runShortcuts = (event: KeyboardEvent): void => {
		if (
			isEditable(event.target)
			|| event.ctrlKey
			|| event.metaKey
			|| event.altKey
			|| event.repeat
		) {
			return;
		}

		if (event.code === 'KeyG' && !event.shiftKey) {
			startChord();
			return;
		}

		if (!awaitingChord) {
			return;
		}

		clearChord();
		const targetTab = getTargetTab(event.code);
		if (!targetTab) {
			return;
		}

		event.preventDefault();
		event.stopImmediatePropagation();
		targetTab.click();
	};

	signal.addEventListener('abort', clearChord);
	document.body.addEventListener('keydown', runShortcuts, {signal, capture: true});
}

void features.add(import.meta.url, {
	shortcuts: {
		'g <number>': 'Go to PR tab <number>',
		'g →': 'Go to next PR tab',
		'g ←': 'Go to previous PR tab',
	},
	include: [
		pageDetect.isPR,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/4

*/
