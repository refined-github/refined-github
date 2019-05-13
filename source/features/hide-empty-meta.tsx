import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	if (select.exists('.repository-meta em') && !select.exists('.js-edit-repo-meta-button')) {
		select('.repository-meta')!.style.display = 'none';
	}
}

features.add({
	id: 'hide-empty-meta',
	description: 'Hide the placeholder text for when there’s no repo description',
	include: [
		features.isRepoRoot
	],
	load: features.onAjaxedPages,
	init
});
