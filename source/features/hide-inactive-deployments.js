import select from 'select-dom';

export default function () {
	const deployments = select.all('.discussion-item .deployment-meta');

	deployments.forEach((deployment, index) => {
		const discussionItem = deployment.closest(`.discussion-item`);

		const isInactive = select.exists(`.is-inactive`, deployment);
		const isLastDeployment = (index === deployments.length - 1);

		if (isInactive && !isLastDeployment) {
			discussionItem.classList.add('rgh-inactive-deployment');
		} else {
			discussionItem.classList.remove('rgh-inactive-deployment');
		}
	});
}
