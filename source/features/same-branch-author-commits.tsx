import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void | false {
	for (const author of select.all('#repo-content-pjax-container .js-navigation-container a.commit-author')) {
		author.pathname = location.pathname;
		author.dataset.pjax = '#repo-content-pjax-container';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	init,
});
