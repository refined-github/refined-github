import {$optional, $$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

// This feature doesn't need an active observer
function init(): void {
	// Selects all the deployments first so that we can leave the last one on the page
	const deployments = $$optional('.js-socket-channel[data-gid^="PR"]:has(.octicon-rocket)');
	deployments.pop(); // Don't hide the last deployment, even if it is inactive

	for (const deployment of deployments) {
		if ($optional('[title="Deployment Status Label: Inactive"]', deployment)) {
			deployment.remove();
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

https://github.com/btkostner/btkostner.io/pull/10

*/
