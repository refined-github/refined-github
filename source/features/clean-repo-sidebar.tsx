import './clean-repo-sidebar.css';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {
	$, $closest, $optional, elementExists,
} from 'select-dom';

import features from '../feature-manager.js';

const releasesSidebarSelector = '.Layout-sidebar .BorderGrid-cell h2 a[href$="/releases"]';
async function cleanReleases(): Promise<void> {
	const sidebarReleases = await elementReady(releasesSidebarSelector, {waitForChildren: false});
	if (!sidebarReleases) {
		return;
	}

	const releasesSection = $closest('.BorderGrid-cell', sidebarReleases);
	if (!elementExists('.octicon-tag', releasesSection)) {
		// Hide the whole section if there's no releases
		releasesSection.hidden = true;
	}
}

async function hideLanguageHeader(): Promise<void> {
	await domLoaded;

	const lastSidebarHeader = $optional('.Layout-sidebar .BorderGrid-row:last-of-type h2');
	if (lastSidebarHeader?.textContent === 'Languages') {
		lastSidebarHeader.hidden = true;
	}
}

// Hide empty meta if it's not editable by the current user
async function hideEmptyMeta(): Promise<void> {
	await domLoaded;

	if (!pageDetect.canUserAdminRepo()) {
		$optional('.Layout-sidebar .BorderGrid-cell > .text-italic')?.remove();
	}
}

async function moveReportLink(): Promise<void> {
	await domLoaded;

	const reportLink = $optional('.Layout-sidebar a[href^="/contact/report-content"]')?.parentElement;
	if (reportLink) {
		// Your own repos don't include this link
		$('.Layout-sidebar .BorderGrid-row:last-of-type .BorderGrid-cell').append(reportLink);
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
