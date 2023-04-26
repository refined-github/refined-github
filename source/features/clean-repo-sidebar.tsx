import './clean-repo-sidebar.css';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
// The h2 is to avoid hiding website links that include '/releases' #4424
export const releasesSidebarSelector = '.Layout-sidebar .BorderGrid-cell h2 a[href$="/releases"]';
async function cleanReleases(): Promise<void> {
	const sidebarReleases = await elementReady(releasesSidebarSelector, {waitForChildren: false});
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

async function moveReportLink(): Promise<void> {
	await domLoaded;

	const reportLink = select('.Layout-sidebar a[href^="/contact/report-content"]')!.parentElement!;
	select('.Layout-sidebar .BorderGrid-row:last-of-type .BorderGrid-cell')!.append(reportLink);
}

async function init(): Promise<void> {
	document.documentElement.classList.add('rgh-clean-repo-sidebar');

	await Promise.all([
		cleanReleases(),
		hideEmptyPackages(),
		hideLanguageHeader(),
		hideEmptyMeta(),
		moveReportLink(),
	]);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
