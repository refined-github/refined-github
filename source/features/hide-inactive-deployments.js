import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';

export default function () {
	observeEl('.js-discussion', () => {
		const deployments = select.all('.discussion-item .deployment-meta');
		deployments.pop(); // Don't hide the last deployment, even if it is inactive

		for (const deployment of deployments) {
			const isInactiveDeployment = select.exists('.is-inactive', deployment);
			if (isInactiveDeployment) {
				const discussionItem = deployment.closest('.discussion-item');
				discussionItem.dataset.rghInactiveDeployment = 'true';
			}
		}
	}, {
		childList: true,
		attributes: true,
		subtree: true,
		attributeFilter: ['class']
	});
}
