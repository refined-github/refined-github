import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	observe('[aria-label="You do not have permission to edit this milestone."]', {
		add(icon) {
			icon.parentElement!.remove();
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Hides the milestone sorter UI if you don’t have permission to use it.',
	screenshot: 'https://user-images.githubusercontent.com/7753001/56913933-738a2880-6ae5-11e9-9d13-1973cbbf5df0.png'
}, {
	include: [
		pageDetect.isMilestone
	],
	init: onetime(init)
});
