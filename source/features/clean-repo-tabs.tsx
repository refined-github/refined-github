import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {hideTab} from '../components/extensible-nav-store.js';

function init(): void {
	hideTab('projects');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});
