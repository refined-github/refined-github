import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	if (select.exists('.repository-meta em') && !select.exists('.js-edit-repo-meta-button')) {
		select('.repository-meta')!.style.display = 'none';
	}
}

features.add({
	id: 'hide-empty-meta',
	description: 'Hide nonessential files from the GitHub file browser',
	include: [
		features.isRepoRoot
	],
	load: features.onAjaxedPages,
	init
});
