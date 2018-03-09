import select from 'select-dom';

export default function () {
	const deployments = select.all('.discussion-item .deployment-meta');
	deployments.pop(); // don't hide the last deployment, even if it is inactive

	for (const deployment of deployments) {
		const isInactiveDeployment = select.exists('.is-inactive', deployment);
		if (isInactiveDeployment) {
			const discussionItem = deployment.closest('.discussion-item');
			discussionItem.setAttribute('data-rgh-inactive-deployment', 'true');
		}
	}
}
