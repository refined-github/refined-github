import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onNewComments from '../github-events/on-new-comments.js';

function init(): void {
	// Selects all the deployments first so that we can leave the last one on the page
	const deployments = select.all('.js-socket-channel[data-url*="/partials/deployed_event/"]');
	deployments.pop(); // Don't hide the last deployment, even if it is inactive

	for (const deployment of deployments) {
		if (select.exists('[title="Deployment Status Label: Inactive"]', deployment)) {
			deployment.remove();
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	additionalListeners: [
		onNewComments,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
