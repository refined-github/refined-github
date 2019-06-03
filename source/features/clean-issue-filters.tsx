import select from 'select-dom';
import features from '../libs/features';
import {v4} from '../libs/api';
import {getOwnerAndRepo, idx} from '../libs/utils';

async function init(): Promise<void> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const result = await v4(`
		query {
			repository(owner: "${ownerName}", name: "${repoName}") {
				projects { totalCount }
				milestones { totalCount }
				labels { totalCount }
			},
			organization(login: "${ownerName}") {
				projects { totalCount }
			}
		}
	`, {
		allowErrors: true
	});

	// Hide projects filter only if there are no repo and organization level projects
	if (result.repository.projects.totalCount === 0 && !idx(result, ['organization', 'projects', 'totalCount'])) {
		select('[data-hotkey="p"')!.parentElement!.remove();
	}

	// Hide milestones filter if there are none
	if (result.repository.milestones.totalCount === 0) {
		select('[data-hotkey="m"')!.parentElement!.remove();
	}
}

features.add({
	id: 'clean-issue-filters',
	description: 'Hide irrelevant issue/PR filters',
	init,
	load: features.onAjaxedPages,
	include: [
		features.isPRList,
		features.isIssueList
	]
});
