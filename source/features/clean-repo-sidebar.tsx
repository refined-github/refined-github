import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	// Hide empty meta if it’s not editable by the current user
	if (!select.exists('.repository-content [aria-label="Edit repository metadata"]')) {
		select('.repository-content .BorderGrid-cell:first-child > .text-italic')!.remove();
	}

	// Hide redundant "Releases" section from repo sidebar
	const sidebarReleases = await elementReady('.BorderGrid-cell a[href$="/releases"]');
	sidebarReleases!.closest('.BorderGrid-row')!.setAttribute('hidden', '');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot
	],
	init
});
