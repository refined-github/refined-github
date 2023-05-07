import {oneEvent} from 'delegate-it';

import observe from '../helpers/selector-observer.js';

// This event ensures that the callback appears exclusively to the person that merged the PR and not anyone who was on the page at the time of the merge
export default async function onPrMerge(callback: VoidFunction, signal: AbortSignal): Promise<void> {
	await oneEvent('.js-merge-commit-button', 'click', {signal});
	observe('.TimelineItem-badge .octicon-git-merge', callback, {signal});
}
