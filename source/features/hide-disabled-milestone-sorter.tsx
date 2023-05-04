import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

// TODO: CSS-only feature via :has selector
function init(signal: AbortSignal): void {
	observe(
		'[aria-label="You do not have permission to edit this milestone."]',
		icon => {
			icon.parentElement!.remove();
		},
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isMilestone,
	],
	init,
});
