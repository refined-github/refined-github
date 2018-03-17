import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';
import observeEl from '../libs/simplified-element-observer';

export default function () {
	if (!pageDetect.isPR()) {
		return;
	}

	observeEl('.js-discussion', () => {
		const deployments = select.all('.discussion-item .deployment-meta');
		deployments.pop(); // Don't hide the last deployment, even if it is inactive

		for (const deployment of deployments) {
			if (select.exists('.is-inactive', deployment)) {
				deployment.closest('.discussion-item').classList.add('rgh-inactive-deployment');
			}
		}
	});
}
