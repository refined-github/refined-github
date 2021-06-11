import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getTabCount from '../github-helpers/get-tab-count';

async function init(): Promise<void | false> {
	const packagesTab = await elementReady('.UnderlineNav-item[href$="?tab=packages"]:not(.selected)');
	if (!packagesTab || await getTabCount(packagesTab) > 0) {
		return false;
	}

	packagesTab.closest('.UnderlineNav-item')!.remove();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isUserProfile
	],
	exclude: [
		// Keep it visible on your own profile due to #3737
		pageDetect.isOwnUserProfile
	],
	init
});
