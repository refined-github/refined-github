import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepo} from '../github-helpers';
import * as api from '../github-helpers/api';

const getWorkflowsCount = cache.function(async (): Promise<number> => {
	const {workflows} = await api.v3('actions/workflows');
	return workflows.length;
}, {
	maxAge: {days: 1},
	cacheKey: (): string => __filebasename + ':' + getRepo()!.nameWithOwner
});

async function removeActionsTab(): Promise<void | false> {
	const actionsTab = await elementReady('[data-hotkey="g a"]');

	if (
		!actionsTab || // Actions Tab does not exist 🎉
		actionsTab.matches('.selected') || // User is on Actions tab 👀
		await getWorkflowsCount() > 0 // Actions Workflows are configured for the repository
	) {
		return false;
	}

	actionsTab.remove();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		// Repo owners should see the tab. If they don't need it, they should disable actions altogether
		pageDetect.canUserEditRepo
	],
	awaitDomReady: false,
	init: removeActionsTab
});
