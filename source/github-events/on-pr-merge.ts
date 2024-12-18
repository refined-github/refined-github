import oneEvent from 'one-event';

import observe from '../helpers/selector-observer.js';

// This event ensures that the callback appears exclusively to the person that merged the PR and not anyone who was on the page at the time of the merge
export default async function onPrMerge(callback: VoidFunction, signal: AbortSignal): Promise<void> {
	// It must start listening early or else the animation ID will be generated incorrectly (ancestor)
	// WARNING: Be very careful about the value of ancestor if you refactor this code
	const mergeEvent = new Promise(resolve => {
		observe('.TimelineItem-badge .octicon-git-merge', resolve, {ancestor: 4});
	});

	// TODO: Restore delegate-it after https://github.com/fregante/delegate-it/issues/55
	// Possible selector + textContent filter: '[aria-label="Checks"] ~ div:has(textarea) button[data-size="medium"][data-variant="primary"]'
	await oneEvent(document.body, 'click', {signal, filter: ({target}: Event) => {
		const clicked = target as HTMLElement;
		// TODO: Drop `js-merge-commit-button` in May 2025
		return Boolean(clicked.closest('.js-merge-commit-button'))
			|| /^Confirm .+ merge$/i.test(clicked.textContent ?? '');
	}});

	// It won't resolve once the signal is aborted
	await mergeEvent;

	if (signal.aborted) {
		throw new Error('The code shouldn’t have reached this point');
	} else {
		callback();
	}
}
