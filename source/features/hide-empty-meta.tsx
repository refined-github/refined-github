import select from 'select-dom';
import features from '../libs/features';

function init() {
	const meta = select('.repository-meta');
	if (select.exists('em', meta) && !select.exists('.js-edit-repo-meta-button')) {
		meta.style.display = 'none';
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
