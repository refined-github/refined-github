import './mark-merge-commits-in-list.css';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

function init(): void {
	for (const commit of select.all('.commits-list-item')) {
		if (select.exists('[title^="Merge pull request"]', commit)) {
			commit.classList.add('refined-github-merge-commit');
			const icon = icons.mergedPullRequest();
			select('.commit-title', commit)!.prepend(icon);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Dims merge commits in commits list.',
	screenshot: false,
	include: [
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
