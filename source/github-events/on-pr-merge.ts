import {oneEvent} from 'delegate-it';

import observe from '../helpers/selector-observer';

export default async function onPrMerge(callback: VoidFunction, signal: AbortSignal): Promise<void> {
	await oneEvent('.js-merge-commit-button', 'click', {signal});
	observe('.TimelineItem-badge .octicon-git-merge', callback, {signal});
}
