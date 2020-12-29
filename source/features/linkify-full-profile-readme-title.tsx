import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const link = $('.user-profile-nav + div .octicon-smiley + a');
	while (link?.nextSibling) {
		link.append(link.nextSibling);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isUserProfileMainTab
	],
	init
});
