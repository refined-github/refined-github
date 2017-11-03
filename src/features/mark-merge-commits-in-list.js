import select from 'select-dom';
import * as icons from '../libs/icons';

export default function () {
	for (const commit of select.all('.commits-list-item:not(.refined-github-merge-commit)')) {
		if (select.exists('[title^="Merge pull request"]', commit)) {
			commit.classList.add('refined-github-merge-commit');
			commit.querySelector('.commit-avatar-cell').prepend(icons.mergedPullRequest());
			commit.querySelector('.avatar').classList.add('avatar-child');
		}
	}
}

