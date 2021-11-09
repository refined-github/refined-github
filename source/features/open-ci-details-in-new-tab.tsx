import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const CIDetailsLinks = select.all('a.status-actions');
	for (const link of CIDetailsLinks) {
		link.setAttribute('target', '_blank');
		link.setAttribute('rel', 'noopener');
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
