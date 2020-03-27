import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const deployments = select.all(`
		.TimelineItem [title^="Deployment Status Label:"],
		.js-socket-channel[data-url$="/pull_requests/events/deployed"] .TimelineItem a.btn
	`);
	deployments.pop(); // Don't hide the last deployment, even if it is inactive

	for (const deployment of deployments) {
		if (deployment.title === 'Deployment Status Label: Inactive') {
			deployment.closest<HTMLElement>('.TimelineItem')!.hidden = true;
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
