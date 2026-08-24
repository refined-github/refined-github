import './clean-repo-sidebar.css';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$optional, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {assertNodeContent} from '../helpers/dom-utils.js';

// The h2 is to avoid hiding website links that include '/releases' #4424
async function cleanReleases(signal: AbortSignal): Promise<void> {
	const sidebarReleases = await elementReady('[class*="PageLayout-Pane"] [class*="SidebarSection-module__sidebarSection"] h2 a[href$="/releases"]', {
		signal,
		stopOnDomReady: false,
		waitForChildren: false,
	});
	if (!sidebarReleases) {
		return;
	}

	const releasesSection = closestElement('[class*="SidebarSection-module__sidebarSection"]', sidebarReleases);
	if (
		// Hide the whole section if there's no releases
		!elementExists('.octicon-tag', releasesSection)
		// Don't hide the section if it has a "Create new release" link
		&& !elementExists('a[href$="releases/new"]', releasesSection)
	) {
		releasesSection.hidden = true;
	}
}

async function hideLanguageHeader(signal: AbortSignal): Promise<void> {
	const languageHeader = await elementReady("[class*='PageLayout-Pane'] [class*='SidebarSection-module__sidebarSection']:has([data-component='ProgressBar']) > h2", {
		signal,
		stopOnDomReady: false,
		waitForChildren: false,
	});
	if (!languageHeader) {
		return;
	}

	assertNodeContent(languageHeader.firstChild, 'Languages');
	languageHeader.classList.add('sr-only');
}

async function moveReportLink(signal: AbortSignal): Promise<void> {
	const lastSection = await elementReady("[class*='PageLayout-Pane'] [class*='SidebarSection-module__sidebarSection']:last-child:not(:has([data-component='SkeletonText']))", {
		signal,
		stopOnDomReady: false,
		waitForChildren: false,
	});
	if (!lastSection) {
		return;
	}

	// Your own repos don't include this link
	const reportLink = $optional("[class*='PageLayout-Pane'] a[href^='/contact/report-content']")?.parentElement;
	if (reportLink) {
		lastSection.append(reportLink);
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
