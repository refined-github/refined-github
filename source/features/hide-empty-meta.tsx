import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	if (select.exists('.repository-content em') && !select.exists('.js-edit-repo-meta-button')) {
		select('.repository-content').firstElementChild!.remove();
	}
}

features.add({
	id: 'hide-empty-meta',
	include: [
		features.isRepoRoot
	],
	load: features.onAjaxedPages,
	init
});
