import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(signal: AbortSignal): Deinit {
	const observer = new MutationObserver(() => {
		const deleteButton = select('[action$="/cleanup"] [type="submit"]');
		if (deleteButton) {
			deleteButton.dataset.disableWith = 'Auto-deleting…';
			deleteButton.click();
			observer.disconnect();
		}
	});

	const delegateController = delegate(document, '.js-merge-commit-button', 'click', () => {
		delegateController.abort();
		observer.observe(select('.discussion-timeline-actions')!, {childList: true});
	}, {signal});

	return observer;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
