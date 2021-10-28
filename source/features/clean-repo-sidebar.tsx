import './clean-repo-sidebar.css';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function removeReadmeLink(): Promise<void> {
	// Hide "Readme" link made unnecessary by toggle-files-button #3580
	(await elementReady('.Link--muted[href="#readme"]'))?.parentElement!.remove();
}

async function cleanLicenseText(): Promise<void> {
	// Remove whitespace in license link to fix alignment of icons https://github.com/refined-github/refined-github/pull/3974#issuecomment-780213892
	const licenseLink = await elementReady('.repository-content .octicon-law');
	if (licenseLink) {
		licenseLink.nextSibling!.textContent = licenseLink.nextSibling!.textContent!.trim();
	}
}

async function cleanReleases(): Promise<void> {
	const sidebarReleases = await elementReady('.BorderGrid-cell h2 a[href$="/releases"]', {waitForChildren: false});
	if (!sidebarReleases) {
		return;
	}

	const releasesSection = sidebarReleases.closest<HTMLElement>('.BorderGrid-cell')!;
	if (!select.exists('.octicon-tag', releasesSection)) {
		// Hide the whole section if there's no releases
		releasesSection.hidden = true;
		return;
	}

	// Collapse "Releases" section into previous section
	releasesSection.classList.add('border-0', 'pt-3');
	sidebarReleases.closest('.BorderGrid-row')!
		.previousElementSibling! // About’s .BorderGrid-row
		.firstElementChild! // About’s .BorderGrid-cell
		.classList.add('border-0', 'pb-0');

	// Hide header and footer
	for (const unnecessaryInformation of select.all(':scope > :not(a)', releasesSection)) {
		unnecessaryInformation.hidden = true;
	}

	// Align latest tag icon with the icons of other meta links
	const tagIcon = select('.octicon-tag:not(.color-text-success, .color-fg-success)', releasesSection)!;
	if (tagIcon) {
		tagIcon.classList.add('mr-2');
		// Remove whitespace node
		tagIcon.nextSibling!.remove();
	}
}

async function hideEmptyPackages(): Promise<void> {
	const packagesCounter = await elementReady('.BorderGrid-cell a[href*="/packages?"] .Counter', {waitForChildren: false})!;
	if (packagesCounter && packagesCounter.textContent === '0') {
		packagesCounter.closest<HTMLElement>('.BorderGrid-row')!.hidden = true;
	}
}

async function init(): Promise<void> {
	document.body.classList.add('rgh-clean-repo-sidebar');

	void removeReadmeLink();
	void cleanLicenseText();
	void cleanReleases();
	void hideEmptyPackages();

	await domLoaded;

	// Hide empty meta if it’s not editable by the current user
	if (!pageDetect.canUserEditRepo()) {
		select('.repository-content .BorderGrid-cell > .text-italic')?.remove();
	}

	// Hide "Language" header
	const lastSidebarHeader = select('.repository-content .BorderGrid-row:last-of-type h2');
	if (lastSidebarHeader?.textContent === 'Languages') {
		lastSidebarHeader.hidden = true;
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
