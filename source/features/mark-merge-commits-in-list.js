import select from 'select-dom';
import * as icons from '../libs/icons';

export default function () {
	for (const commit of select.all('.commits-list-item:not(.refined-github-merge-commit)')) {
		if (select.exists('[title^="Merge pull request"]', commit)) {
			commit.classList.add('refined-github-merge-commit');
			const icon = icons.mergedPullRequest();
			icon.classList.add('avatar');
			select('.AvatarStack-body', commit).prepend(icon);
			select('.AvatarStack', commit).classList.add('AvatarStack--two');
		}
	}
}
