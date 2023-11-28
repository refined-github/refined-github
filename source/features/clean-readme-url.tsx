import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function init(signal: AbortSignal): void {
	const url = new URL(location.href);
	if (url.searchParams.get('tab') === 'readme-ov-file') {
		url.searchParams.delete('tab');
		history.replaceState(history.state, '', url.href);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoHome,
	],
	init,
});
