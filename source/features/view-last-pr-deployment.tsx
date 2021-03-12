import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';

const lastDeploymentSelector = '.js-timeline-item [data-url$="deployed"] .TimelineItem-body .btn[target="_blank"]';

function init(): void {
	const lastDeployment = select.last(lastDeploymentSelector)!.cloneNode(true);
	lastDeployment.classList.add('mr-1');
	lastDeployment.textContent = 'View last deployment';

	select('.gh-header-actions')!.prepend(lastDeployment);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	exclude: [
		() => !select.exists(lastDeploymentSelector)
	],
	init() {
		observeElement(select('#partial-discussion-header')!.parentElement!, init);
	}
});
