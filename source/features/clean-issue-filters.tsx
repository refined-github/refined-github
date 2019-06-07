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
			}
			organization(login: "${ownerName}") {
				projects { totalCount }
			}
		}
	`, {
		allowErrors: true
	});

	// If the repo and organization has no projects, its selector will be empty
	if (
		result.repository.projects.totalCount === 0 &&
		(!result.organization || result.organization.projects.totalCount === 0)
	) {
		select('[data-hotkey="p"')!.parentElement!.remove();
	}

	// If the repo has no milestones, its selector will be empty
	if (result.repository.milestones.totalCount === 0) {
		select('[data-hotkey="m"')!.parentElement!.remove();
	}
}

features.add({
	id: 'clean-issue-filters',
	description: 'Hide empty issue/PR filters in lists',
	init,
	load: features.onAjaxedPages,
	include: [
		features.isRepoDiscussionList
	]
});
