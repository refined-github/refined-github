import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getTabCount from './remove-projects-tab';

async function init(): Promise<void | false> {
	const packagesTab = select('.UnderlineNav-item[href$="?tab=packages"]:not(.selected)');
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
