import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

function init(): void {
	// Hide if it’s not editable by the current user
	if (select.exists('.repository-content > :first-child:not(#repo-meta-edit) em')) {
		select('.repository-content')!.firstElementChild!.remove();
	}
}

features.add({
	id: __featureName__,
	description: 'Hides the placeholder text in repos without a description.',
	screenshot: false
}, {
	include: [
		pageDetect.isRepoRoot
	],
	init
});
