import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';

// This feature doesn't need an active observer
function init(): void {
	// Selects all the deployments first so that we can leave the last one on the page
	const deployments = select.all('.js-socket-channel[data-url*="/partials/deployed_event/"]');
	deployments.pop(); // Don't hide the last deployment, even if it is inactive

	for (const deployment of deployments) {
		// TODO: Rewrite with :has selector
		if (select.exists('[title="Deployment Status Label: Inactive"]', deployment)) {
			deployment.remove();
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});
