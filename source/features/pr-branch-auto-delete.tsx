import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';

function init(signal: AbortSignal): Deinit {
	const subscription = delegate(document, '.js-merge-commit-button', 'click', () => {
		subscription.destroy();

		observeElement('.discussion-timeline-actions', (_, observer) => {
			const deleteButton = select('[action$="/cleanup"] [type="submit"]');
			if (deleteButton) {
				deleteButton.dataset.disableWith = 'Auto-deleting…';
				deleteButton.click();
				observer.disconnect();
			}
		}, {
			childList: true,
			signal,
		});
	});

	return subscription;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
