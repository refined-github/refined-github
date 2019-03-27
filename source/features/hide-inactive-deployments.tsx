import select from 'select-dom';
import features from '../libs/features';

function init() {
	const deployments = select.all('.discussion-item .deployment-meta');
	deployments.pop(); // Don't hide the last deployment, even if it is inactive

	for (const deployment of deployments) {
		if (select.exists('.is-inactive', deployment)) {
			deployment.closest('.discussion-item').classList.add('rgh-inactive-deployment');
		}
	}
}

features.add({
	id: 'hide-inactive-deployments',
	description: 'Inactive deployments in PR timelines are hidden',
	include: [
		features.isPRConversation
	],
	load: features.onNewComments,
	init
});
