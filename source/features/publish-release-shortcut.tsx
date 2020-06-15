import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	select('textarea')?.classList.add('js-quick-submit');
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
