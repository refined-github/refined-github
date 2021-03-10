import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';

function init(): void | false {
	const lastDeployment = select.last('.js-timeline-item [data-url$="deployed"] .TimelineItem-body .btn[target="_blank"]');
	if (!lastDeployment) {
		return false;
	}

	const button = lastDeployment.cloneNode(true);
	button.classList.add('mr-1');
	button.textContent = 'View last deployment';

	select('.gh-header-actions')!.prepend(button);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	init() {
		observeElement(select('#partial-discussion-header')!.parentElement!, init);
	}
});
