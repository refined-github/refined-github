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

void features.add({
	id: __filebasename,
	description: 'Hides the `Packages` tab if it’s empty (in repositories and user profiles).',
	screenshot: 'https://user-images.githubusercontent.com/44045911/93541991-80354800-f98a-11ea-8347-a571abbbd318.png'
}, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isUserProfile
	],
	awaitDomReady: false,
	init
});
