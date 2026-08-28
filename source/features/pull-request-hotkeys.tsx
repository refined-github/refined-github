import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$$} from 'select-dom';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

async function init(signal: AbortSignal): Promise<void> {
	const tabnav = await elementReady([
		'[aria-label="Pull request tabs"]',
		'[aria-label="Pull request navigation tabs"]', // Commits list tab
		'[aria-label="Pull request navigation"]', // Renamed on Conversation/Commits sub-pages (issue #10006)
	]);
	const tabs = $$('a', tabnav);
	const lastTab = tabs.length - 1;
	const selectedIndex = tabs.findIndex(tab => tab.matches('.selected, [aria-current]'));

	for (const [index, tab] of tabs.entries()) {
		// Reset previous hotkeys because the DOM persists across soft navigations
		// https://github.com/refined-github/refined-github/pull/9916#issuecomment-5157852083
		tab.dataset.hotkey = `g ${index + 1}`;
	}

	// The previous/next hotkeys are registered on dedicated hidden elements instead of
	// being combined with the tab's own `g <number>` hotkey via a comma-separated
	// `data-hotkey` value. GitHub's native hotkey handler doesn't reliably resolve
	// multiple `g`-prefixed sequences sharing one element (e.g. `g 1,g ArrowLeft`),
	// which caused arrow-key navigation to jump to the wrong tab. See issue #10006.
	const previousIndex = selectedIndex === 0 ? lastTab : selectedIndex - 1;
	const nextIndex = selectedIndex === lastTab ? 0 : selectedIndex + 1;
	registerHotkey('g ArrowLeft', tabs[previousIndex].href, {signal});
	registerHotkey('g ArrowRight', tabs[nextIndex].href, {signal});
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
