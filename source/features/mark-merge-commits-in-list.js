import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

function init() {
	for (const commit of select.all('.commits-list-item')) {
		if (select.exists('[title^="Merge pull request"]', commit)) {
			commit.classList.add('refined-github-merge-commit');
			const icon = icons.mergedPullRequest();
			select('.commit-title', commit).prepend(icon);
		}
	}
}

features.add({
	id: 'mark-merge-commits-in-list',
	include: [
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
