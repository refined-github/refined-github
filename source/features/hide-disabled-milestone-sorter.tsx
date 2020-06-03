import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';

function init(): void {
	for (const icon of select.all('[aria-label="You do not have permission to edit this milestone."]')) {
		icon.parentElement!.remove();
	}
}

void features.add({
	id: __filebasename,
	description: 'Hides the milestone sorter UI if you don’t have permission to use it.',
	screenshot: 'https://user-images.githubusercontent.com/7753001/56913933-738a2880-6ae5-11e9-9d13-1973cbbf5df0.png'
}, {
	include: [
		pageDetect.isMilestone
	],
	exclude: [
		// Issues container doesn't exist for milestones without (open) issues
		() => !select.exists('.js-milestone-issues-container')
	],
	init: () => {
		observeElement('.js-milestone-issues-container', init);
	}
});
