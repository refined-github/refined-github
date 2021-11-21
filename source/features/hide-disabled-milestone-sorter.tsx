import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	observe('[aria-label="You do not have permission to edit this milestone."]', {
		add(icon) {
			icon.parentElement!.remove();
		},
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isMilestone,
	],
	init: onetime(init),
});
