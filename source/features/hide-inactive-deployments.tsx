import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const deployments = select.all('.discussion-item .deployment-meta');
	deployments.pop(); // Don't hide the last deployment, even if it is inactive

	for (const deployment of deployments) {
		if (select.exists('.is-inactive', deployment)) {
			(deployment.closest('.discussion-item') as HTMLElement).hidden = true;
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Hides inactive deployments in PRs.',
	screenshot: 'https://github.com/sindresorhus/refined-github/issues/1144',
	include: [
		features.isPRConversation
	],
	load: features.onNewComments,
	init
});
