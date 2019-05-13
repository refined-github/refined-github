import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const emptyDescription = select('.repository-content > :not(#readme):not(.commit-tease) em');

	if (emptyDescription && !select.exists('#repo-meta-edit')) {
		emptyDescription.style.setProperty('display', 'none', 'important');
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
