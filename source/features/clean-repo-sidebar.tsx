import './clean-repo-sidebar.css';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	document.body.classList.add('rgh-clean-repo-sidebar');

	// Hide redundant "Releases" section
	const sidebarReleases = await elementReady('.BorderGrid-cell a[href$="/releases"]');
	sidebarReleases!.closest<HTMLElement>('.BorderGrid-row')!.hidden = true;

	// Hide empty "Packages" section
	const packagesCounter = await elementReady('.BorderGrid-cell a[href*="/packages?"] .Counter')!;
	if (packagesCounter && packagesCounter.textContent === '0') {
		packagesCounter.closest<HTMLElement>('.BorderGrid-row')!.hidden = true;
	}

	// Hide empty meta if it’s not editable by the current user
	// TODO: once it's fixed, use https://github.com/fregante/github-url-detection/blob/4840d85d31d59bfe71e884ef42c482fbfff2d955/index.ts#L490
	if (!select.exists('.repository-content [aria-label="Edit repository metadata"]')) {
		select('.repository-content .BorderGrid-cell:first-child > .text-italic')?.remove();
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot
	],
	awaitDomReady: false,
	init
});
