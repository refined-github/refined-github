import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getTabCount from './remove-projects-tab';

async function init(): Promise<void | false> {
	const packagesCounter = await elementReady([
		'.numbers-summary [href$="/packages"]', // `isRepoRoot`
		'.UnderlineNav-item[href$="?tab=packages"]:not(.selected)', // `isUserProfile`
		'.orgnav > .pagehead-tabs-item[href$="/packages"]:not(.selected)' // `isOrganizationProfile`
	].join());

	if (!packagesCounter || await getTabCount(packagesCounter) > 0) {
		return false;
	}

	(packagesCounter.closest('li, .UnderlineNav-item') ?? packagesCounter).remove();
}

features.add({
	id: __filebasename,
	description: 'Hides the `Packages` tab if it’s empty (in repositories and user profiles).',
	screenshot: 'https://user-images.githubusercontent.com/35382021/62426530-688ef780-b6d5-11e9-93f2-515110aed1eb.jpg'
}, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isUserProfile,
		pageDetect.isOrganizationProfile
	],
	waitForDomReady: false,
	init
});
