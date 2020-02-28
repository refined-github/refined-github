import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import observeElement from '../libs/simplified-element-observer';

function init(): void {
	const subscription = delegate('.js-merge-commit-button', 'click', () => {
		subscription.destroy();

		observeElement('.discussion-timeline-actions', (_, observer) => {
			const deleteButton = select('[action$="/cleanup"] [type="submit"]');
			if (deleteButton) {
				deleteButton.dataset.disableWith = 'Auto-deleting…';
				deleteButton.click();
				observer.disconnect();
			}
		});
	});
}

features.add({
	id: __featureName__,
	description: 'Automatically deletes the branch right after merging a PR, if possible.',
	screenshot: false,
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
