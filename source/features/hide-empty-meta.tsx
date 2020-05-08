import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import features from '../libs/features';

function init(): void {
	// Hide if it’s not editable by the current user
	if (select.exists('.repository-content > :first-child:not(#repo-meta-edit) em')) {
		select('.repository-content')!.firstElementChild!.remove();
	}
}

features.add({
	id: __filebasename,
	description: 'Hides the placeholder text in repos without a description.',
	screenshot: false
}, {
	include: [
		pageDetect.isRepoRoot
	],
	init
});
