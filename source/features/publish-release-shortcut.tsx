import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const publishReleaseButton = select('.js-publish-release');
	if (publishReleaseButton) {
		publishReleaseButton.dataset.hotkey = 'Control+Enter,Meta+Enter';
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a keyboard shortcut to publish a new release while on the new Release page: `control enter`',
	screenshot: false,
	shortcuts: {
		'control enter': 'Publish a new release'
	}
}, {
	include: [
		pageDetect.isReleasesOrTags,
		pageDetect.isNewRelease
	],
	init
});
