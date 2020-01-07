/* eslint-disable promise/prefer-await-to-then */
import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
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

function removeParent(element?: Element): void {
	if (element) { // If may be missing when the feature is entirely disabled
		element.parentElement!.remove();
	}
}

async function init(): Promise<void> {
	const {repoProjectCount, orgProjectCount, milestoneCount} = await getCounts();

	if (repoProjectCount === 0 && orgProjectCount === 0) {
		elementReady('[data-hotkey="p"]').then(removeParent);
	}

	if (milestoneCount === 0) {
		elementReady('[data-hotkey="m"]').then(removeParent);
	}
}

features.add({
	id: __featureName__,
	description: 'Hides `Projects` and `Milestones` filters in discussion lists if they are empty.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/59083449-0ef88f80-8915-11e9-8296-68af1ddcf191.png',
	load: features.nowAndOnAjaxedPages,
	include: [
		features.isRepoDiscussionList
	],
	init
});
