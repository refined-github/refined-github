import delegate from 'delegate-it';

import onAbort from '../helpers/abort-controller';
import observe from '../helpers/selector-observer';

export default function onPrMerge(callback: VoidFunction, signal: AbortSignal): void {
	// TODO: Drop after https://github.com/fregante/delegate-it/issues/30
	const controller = new AbortController();
	onAbort(signal, controller);
	delegate(document, '.js-merge-commit-button', 'click', () => {
		controller.abort();
		observe('.TimelineItem-badge .octicon-git-merge', callback, {signal});
	}, {signal});
}
