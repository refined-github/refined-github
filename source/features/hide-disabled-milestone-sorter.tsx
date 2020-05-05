import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import observeElement from '../libs/simplified-element-observer';

function hide(): void {
	for (const icon of select.all('[aria-label="You do not have permission to edit this milestone."]')) {
		icon.parentElement!.remove();
	}
}

function init(): void {
	observeElement('.js-milestone-issues-container', hide);
}

features.add({
	id: __filebasename,
	description: 'Hides the milestone sorter UI if you don’t have permission to use it.',
	screenshot: 'https://user-images.githubusercontent.com/7753001/56913933-738a2880-6ae5-11e9-9d13-1973cbbf5df0.png'
}, {
	include: [
		pageDetect.isMilestone
	],
	init
});
