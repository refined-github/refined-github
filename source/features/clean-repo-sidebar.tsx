import './clean-repo-sidebar.css';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function cleanReleases(): Promise<void> {
	const sidebarReleases = await elementReady('.Layout-sidebar .BorderGrid-cell h2 a[href$="/releases"]', {waitForChildren: false});
	if (!sidebarReleases) {
		return;
	}

	const releasesSection = sidebarReleases.closest('.BorderGrid-cell')!;
	if (!select.exists('.octicon-tag', releasesSection)) {
		// Hide the whole section if there's no releases
		releasesSection.hidden = true;
		return;
	}

	// Collapse "Releases" section into previous section
	releasesSection.classList.add('border-0', 'pt-md-0');
	sidebarReleases.closest('.BorderGrid-row')!
		.previousElementSibling! // About’s .BorderGrid-row
		.firstElementChild! // About’s .BorderGrid-cell
		.classList.add('border-0', 'pb-0');

	// Align latest tag icon with the icons of other meta links
	const tagIcon = select('.octicon-tag:not(.color-text-success, .color-fg-success)', releasesSection)!;
	if (tagIcon) {
		tagIcon.classList.add('mr-2');
		// Remove whitespace node
		tagIcon.nextSibling!.remove();
	}
}

async function hideEmptyPackages(): Promise<void> {
	const packagesCounter = await elementReady('.Layout-sidebar .BorderGrid-cell a[href*="/packages?"] .Counter', {waitForChildren: false})!;
	if (packagesCounter && packagesCounter.textContent === '0') {
		packagesCounter.closest('.BorderGrid-row')!.hidden = true;
	}
}

async function hideLanguageHeader(): Promise<void> {
	await domLoaded;

	const lastSidebarHeader = select('.Layout-sidebar .BorderGrid-row:last-of-type h2');
	if (lastSidebarHeader?.textContent === 'Languages') {
		lastSidebarHeader.hidden = true;
	}
}

// Hide empty meta if it’s not editable by the current user
async function hideEmptyMeta(): Promise<void> {
	await domLoaded;

	if (!pageDetect.canUserEditRepo()) {
		select('.Layout-sidebar .BorderGrid-cell > .text-italic')?.remove();
	}
}

async function init(): Promise<void> {
	document.documentElement.classList.add('rgh-clean-repo-sidebar');

	await Promise.all([
		cleanReleases(),
		hideEmptyPackages(),
		hideLanguageHeader(),
		hideEmptyMeta(),
	]);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
