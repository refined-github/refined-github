import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';

async function removeActionsTab(): Promise<void | false> {
	const actionsTab = await elementReady('[data-hotkey="g a"]');
	const {workflows} = await api.v3('actions/workflows');

	if (
		!actionsTab || // Actions Tab does not exist 🎉
		actionsTab.matches('.selected') || // User is on Actions tab 👀
		workflows.length > 0 // Actions Workflows are configured for the repository
	) {
		return false;
	}

	actionsTab.remove();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init: removeActionsTab
});
