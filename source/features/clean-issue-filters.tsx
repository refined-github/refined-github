import select from 'select-dom';
import features from '../libs/features';
import * as api from '../libs/api';
import {getOwnerAndRepo} from '../libs/utils';

async function init(): Promise<void> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const result = await api.v4(`
		query {
			repository(owner: "${ownerName}", name: "${repoName}") {
				projects { totalCount }
				milestones { totalCount }
			},
			organization(login: "${ownerName}") {
				projects { totalCount }
			}
			user(login: "${ownerName}") {
				projects { totalCount }
			}
		}
	`, {
		allowErrors: true
	});

	// Hide projects filter only if there are no repo, user, and organization level projects
	if (
		result.repository.projects.totalCount === 0 &&
		(!result.organization || result.organization.projects.totalCount === 0) &&
		(!result.user || result.user.projects.totalCount === 0)
	) {
		select('[data-hotkey="p"')!.parentElement!.remove();
	}

	// Hide milestones filter if there are none
	if (result.repository.milestones.totalCount === 0) {
		select('[data-hotkey="m"')!.parentElement!.remove();
	}
}

features.add({
	id: 'clean-issue-filters',
	description: 'Hide empty issue/PR filters',
	init,
	load: features.onAjaxedPages,
	include: [
		features.isRepoDiscussionList
	]
});
