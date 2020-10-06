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
	screenshot: 'https://user-images.githubusercontent.com/16872793/90910173-ebe4bf00-e3a4-11ea-8fc5-aea3d1a2e5e5.png',
	testOn: ''
}, {
	include: [
		pageDetect.isUserProfileMainTab
	],
	init
});
