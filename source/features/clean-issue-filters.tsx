import cache from 'webext-storage-cache';
import select from 'select-dom';
import features from '../libs/features';
import * as api from '../libs/api';
import {getOwnerAndRepo, getRepoURL, getRepoGQL} from '../libs/utils';

type Counts = {
	repoProjectCount: number;
	orgProjectCount: number;
	milestoneCount: number;
};

const getCounts = cache.function(async (): Promise<Counts> => {
	const {repository, organization} = await api.v4(`
		repository(${getRepoGQL()}) {
			projects { totalCount }
			milestones { totalCount }
		}
		organization(login: "${getOwnerAndRepo().ownerName!}") {
			projects { totalCount }
		}
	`, {
		allowErrors: true
	});

	return {
		repoProjectCount: repository.projects.totalCount,
		orgProjectCount: organization ? organization.projects.totalCount : 0,
		milestoneCount: repository.milestones.totalCount
	};
}, {
	expiration: 3,
	cacheKey: () => __featureName__ + ':' + getRepoURL()
});

async function init(): Promise<void> {
	const {repoProjectCount, orgProjectCount, milestoneCount} = await getCounts();

	// If the repo and organization has no projects, its selector will be empty
	if (repoProjectCount === 0 && orgProjectCount === 0 && select.exists('[data-hotkey="p"')) {
		select('[data-hotkey="p"')!.parentElement!.remove();
	}

	// If the repo has no milestones, its selector will be empty
	if (milestoneCount === 0 && select.exists('[data-hotkey="m"')) {
		select('[data-hotkey="m"')!.parentElement!.remove();
	}
}

features.add({
	id: __featureName__,
	description: 'Hides `Projects` and `Milestones` filters in discussion lists if they are empty.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/59083449-0ef88f80-8915-11e9-8296-68af1ddcf191.png',
	load: features.onAjaxedPages,
	include: [
		features.isRepoDiscussionList
	],
	init
});
