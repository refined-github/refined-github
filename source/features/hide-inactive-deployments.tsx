import select from 'select-dom';
import features from '../libs/features';

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
	id: __featureName__,
	description: 'Hides inactive deployments in PRs.',
	screenshot: 'https://github.com/sindresorhus/refined-github/issues/1144'
}, {
	include: [
		features.isPRConversation
	],
	load: features.onNewComments,
	init
});
