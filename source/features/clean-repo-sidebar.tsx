import './clean-repo-sidebar.css';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	document.body.classList.add('rgh-clean-repo-sidebar');

	// Clean up "Releases" section
	const sidebarReleases = await elementReady('.BorderGrid-cell a[href$="/releases"]', {waitForChildren: false});
	if (sidebarReleases) {
		const releasesSection = sidebarReleases.closest<HTMLElement>('.BorderGrid-row')!;
		releasesSection.previousElementSibling!.classList.add('rgh-clean-releases');
		for (const uselessInformation of select.all('.BorderGrid-cell > :not(a)', releasesSection)) {
			uselessInformation.hidden = true;
		}
	}

	// Hide empty "Packages" section
	const packagesCounter = await elementReady('.BorderGrid-cell a[href*="/packages?"] .Counter', {waitForChildren: false})!;
	if (packagesCounter && packagesCounter.textContent === '0') {
		packagesCounter.closest<HTMLElement>('.BorderGrid-row')!.hidden = true;
	}

	// Hide empty meta if it’s not editable by the current user
	if (!pageDetect.canUserEditRepo()) {
		select('.repository-content .BorderGrid-cell:first-child > .text-italic')?.remove();
	}

	// Hide "Language" header
	const lastSidebarHeader = select('.repository-content .BorderGrid-row:last-of-type h2');
	if (lastSidebarHeader?.textContent === 'Languages') {
		lastSidebarHeader.hidden = true;
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot
	],
	awaitDomReady: false,
	init
});
