import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';

const deploymentSelector = '.js-timeline-item [data-url$="deployed"] .TimelineItem-body .btn[target="_blank"]';

function init(): void {
	const lastDeployment = select.last(deploymentSelector)!.cloneNode(true);
	lastDeployment.classList.add('mr-1');
	lastDeployment.textContent = 'View last deployment';

	select('.gh-header-actions')!.prepend(lastDeployment);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	exclude: [
		() => !select.exists(deploymentSelector)
	],
	init() {
		observeElement(select('#partial-discussion-header')!.parentElement!, init);
	}
});
