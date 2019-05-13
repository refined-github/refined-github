import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	// Hide if it’s not editable by the current user
	if (select.exists('.repository-content > :first-child:not(#repo-meta-edit) em')) {
		select('.repository-content')!.firstElementChild!.remove();
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
