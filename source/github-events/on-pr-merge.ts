import {oneEvent} from 'delegate-it';

import observe from '../helpers/selector-observer.js';

// This event ensures that the feature appears exclusively to the person that merged the PR and not anyone who was on the page at the time of the merge
export default async function waitForPrMerge(signal: AbortSignal): Promise<void> {
	// It must start listening early or else the animation ID will be generated incorrectly (ancestor)
	// WARNING: Be very careful about the value of ancestor if you refactor this code
	const mergeEvent = new Promise(resolve => {
		// `emphasis` excludes merge commit icons added by `mark-merge-commits-in-list`
		observe('.TimelineItem-badge.color-fg-on-emphasis .octicon-git-merge', resolve, {ancestor: 4});
	});

	await oneEvent([
		// TODO: Drop in 2026
		'.js-merge-commit-button',

		// TODO: Add a textContent check after https://github.com/fregante/delegate-it/issues/55
		// TODO: Support "Confirm auto-merge (squash)" button (it's not primary/green)
		'div[class^="MergeBox-module"] div[data-has-label] ~ div button[data-size="medium"][data-variant="primary"]',
	], 'click', {signal});

	// It won't resolve once the signal is aborted
	await mergeEvent;

	if (signal.aborted) {
		throw new Error('The code shouldn’t have reached this point');
	}
}
