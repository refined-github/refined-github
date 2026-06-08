import './clean-repo-sidebar.css';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$, $optional, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';

// The h2 is to avoid hiding website links that include '/releases' #4424
// It's broken: https://github.com/refined-github/refined-github/issues/9339
async function cleanReleases(): Promise<void> {
	const sidebarReleases = await elementReady([
		'[class*="PageLayout-Pane"] .BorderGrid-cell h2 a[href$="/releases"]',
		// TODO [2026-09-01]: Drop old selector
		'.Layout-sidebar .BorderGrid-cell h2 a[href$="/releases"]',
	], {
		waitForChildren: false,
	});
	if (!sidebarReleases) {
		return;
	}

	const releasesSection = closestElement('.BorderGrid-cell', sidebarReleases);
	if (
		// Hide the whole section if there's no releases
		!elementExists('.octicon-tag', releasesSection)
		// Don't hide the section if it has a "Create new release" link
		&& !elementExists('a[href$="releases/new"]', releasesSection)
	) {
		releasesSection.hidden = true;
	}
}

async function hideLanguageHeader(): Promise<void> {
	await domLoaded;

	const lastSidebarHeader = $optional([
		'[class*=\'PageLayout-Pane\'] .BorderGrid-row:last-of-type h2',
		// TODO [2026-09-01]: Drop old selector
		'.Layout-sidebar .BorderGrid-row:last-of-type h2',
	]);
	if (lastSidebarHeader?.textContent === 'Languages') {
		lastSidebarHeader.hidden = true;
	}
}

// Hide empty meta if it’s not editable by the current user
async function hideEmptyMeta(): Promise<void> {
	await domLoaded;

	if (!pageDetect.canUserAdminRepo()) {
		$optional([
			'[class*=\'PageLayout-Pane\'] .BorderGrid-cell > .text-italic',
			// TODO [2026-09-01]: Drop old selector
			'.Layout-sidebar .BorderGrid-cell > .text-italic',
		])?.remove();
	}
}

async function moveReportLink(): Promise<void> {
	await domLoaded;

	const reportLink = $optional([
		'[class*=\'PageLayout-Pane\'] a[href^="/contact/report-content"]',
		// TODO [2026-09-01]: Drop old selector
		'.Layout-sidebar a[href^="/contact/report-content"]',
	])?.parentElement;
	if (reportLink) {
		// Your own repos don't include this link
		$([
			'[class*=\'PageLayout-Pane\'] .BorderGrid-row:last-of-type .BorderGrid-cell',
			'.Layout-sidebar .BorderGrid-row:last-of-type .BorderGrid-cell',
		]).append(reportLink);
	}
}

async function init(): Promise<void> {
	document.documentElement.setAttribute('rgh-clean-repo-sidebar', '');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
	deduplicate: 'has-rgh-inner',
	init: [
		init,
		cleanReleases,
		hideLanguageHeader,
		hideEmptyMeta,
		moveReportLink,
	],
});

/*

Test URLs:

- https://github.com/refined-github/refined-github
- Repo with empty packages section: https://github.com/isaacs/node-glob
- Repo with 1 package: https://github.com/recyclarr/recyclarr
- Repo with tags but not releases: https://github.com/fregante/bin-dir
- Repo with no tags: https://github.com/refined-github/yolo

*/
