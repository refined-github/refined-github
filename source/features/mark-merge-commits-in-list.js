import select from 'select-dom';
import * as icons from '../libs/icons';

export default function () {
	for (const commit of select.all('.commits-list-item')) {
		if (select.exists('[title^="Merge pull request"]', commit)) {
			commit.classList.add('refined-github-merge-commit');
			const icon = icons.mergedPullRequest();
			select('.commit-title', commit).prepend(icon);
		}
	}
}
