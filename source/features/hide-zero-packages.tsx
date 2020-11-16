import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getTabCount from './remove-projects-tab';

async function init(): Promise<void | false> {
	const packagesTab = await elementReady([
		'.BorderGrid-cell a[href$="/packages"]', // `isRepoRoot`
		'.UnderlineNav-item[href$="?tab=packages"]:not(.selected)' // `isUserProfile`
	].join());

	if (!packagesTab || await getTabCount(packagesTab) > 0) {
		return false;
	}

	packagesTab.closest('.BorderGrid-row, .UnderlineNav-item')!.remove();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isUserProfile
	],
	awaitDomReady: false,
	init
});
