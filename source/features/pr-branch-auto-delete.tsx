import delegate from 'delegate-it';
import features from '../libs/features';
import {elementFinder} from '../libs/dom-utils';

function init(): void {
	const [subscription] = delegate('#discussion_bucket', '.js-merge-commit-button', 'click', async () => {
		subscription.destroy();

		const deleteButton = await elementFinder('.branch-action[action$="/cleanup"] [type="submit"]', 500);
		deleteButton.click();
	});
}

features.add({
	id: __featureName__,
	description: 'Automatically deletes the branch right after merging a PR, if possible',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
