import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function init(): void {
	for (const author of $$('.js-navigation-container a.commit-author')) {
		author.pathname = location.pathname;
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	awaitDomReady: true, // Small page
	init,
});
