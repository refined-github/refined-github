import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const link = select('.user-profile-nav + div .octicon-smiley + a');
	while (link?.nextSibling) {
		link.append(link.nextSibling);
	}
}

void features.add({
	id: __filebasename,
	description: 'Linkify the readme text on profile pages.',
	screenshot: 'https://user-images.githubusercontent.com/29491356/89711998-094b7d80-d9e2-11ea-8ae8-2957960d2308.png'
}, {
	include: [
		pageDetect.isUserProfileMainTab
	],
	init
});
