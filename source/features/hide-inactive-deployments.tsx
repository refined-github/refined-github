import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import onNewComments from '../libs/on-new-comments';

function init(): void {
	// Selects all the deployments first so that we can leave the last one on the page
	const deployments = select.all('.js-socket-channel[data-url$="/pull_requests/events/deployed"]');
	deployments.pop(); // Don't hide the last deployment, even if it is inactive

	for (const deployment of deployments) {
		if (select.exists('[title="Deployment Status Label: Inactive"]', deployment)) {
			deployment.remove();
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Hides inactive deployments in PRs.',
	screenshot: 'https://github.com/sindresorhus/refined-github/issues/1144'
}, {
	include: [
		pageDetect.isPRConversation
	],
	additionalListeners: [
		onNewComments
	],
	init
});
