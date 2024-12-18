import {oneEvent} from 'delegate-it';

import observe from '../helpers/selector-observer.js';

// This event ensures that the callback appears exclusively to the person that merged the PR and not anyone who was on the page at the time of the merge
export default async function onPrMerge(callback: VoidFunction, signal: AbortSignal): Promise<void> {
	// It must start listening early or else the animation ID will be generated incorrectly (ancestor)
	// WARNING: Be very careful about the value of ancestor if you refactor this code
	const mergeEvent = new Promise(resolve => {
		// `emphasis` excludes merge commit icons added by `mark-merge-commits-in-list`
		observe('.TimelineItem-badge.color-fg-on-emphasis .octicon-git-merge', resolve, {ancestor: 4});
	});

	await oneEvent([
		// TODO: Drop in May 2025
		'.js-merge-commit-button',

		// `:has(textarea)` excludes the first "Merge pull request" button that only opens the box
		// TODO: Add a textContent check after https://github.com/fregante/delegate-it/issues/55
		// TODO: Support "Confirm auto-merge (squash)" button (it's not primary/green)
		'[aria-label="Checks"] ~ div:has(textarea) button[data-size="medium"][data-variant="primary"]',
	], 'click', {signal});

	// It won't resolve once the signal is aborted
	await mergeEvent;

	if (signal.aborted) {
		throw new Error('The code shouldn’t have reached this point');
	} else {
		callback();
	}
}
