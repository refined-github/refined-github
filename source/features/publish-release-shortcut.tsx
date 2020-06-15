import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	select('textarea')?.classList.add('js-quick-submit');
}

void features.add({
	id: __filebasename,
	description: 'Enables the `control enter` keyboard shortcut to submit a release while on the Release page.',
	screenshot: false
}, {
	include: [
		pageDetect.isReleasesOrTags,
		pageDetect.isNewRelease
	],
	init
});
