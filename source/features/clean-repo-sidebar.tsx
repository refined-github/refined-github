import './clean-repo-sidebar.css';
import * as pageDetect from 'github-url-detection';
import {$optional, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {assertNodeContent} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

function cleanReleases(sidebarReleases: HTMLElement): void {
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

function hideLanguageHeader(languageHeader: HTMLElement): void {
	assertNodeContent(languageHeader.firstChild, 'Languages');
	languageHeader.classList.add('sr-only');
}

function moveReportLink(lastSection: HTMLElement): void {
	// Your own repos don't include this link
	const reportLink = $optional("[class*='PageLayout-Pane'] a[href^='/contact/report-content']")?.parentElement;
	if (reportLink) {
		lastSection.append(reportLink);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	document.documentElement.setAttribute('rgh-clean-repo-sidebar', '');

	// The h2 is to avoid hiding website links that include '/releases' #4424
	observe('[class*="PageLayout-Pane"] [class*="SidebarSection-module__sidebarSection"]:not(:has([data-component="SkeletonText"])) h2 a[href$="/releases"]', cleanReleases, {signal, once: true});
	observe("[class*='PageLayout-Pane'] [class*='SidebarSection-module__sidebarSection']:has([data-component='ProgressBar']) > h2", hideLanguageHeader, {signal, once: true});
	observe("[class*='PageLayout-Pane'] [class*='SidebarSection-module__sidebarSection']:last-child:not(:has([data-component='SkeletonText']))", moveReportLink, {signal, once: true});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
	init,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github
- Repo with empty packages section: https://github.com/isaacs/node-glob
- Repo with 1 package: https://github.com/recyclarr/recyclarr
- Repo with tags but not releases: https://github.com/fregante/bin-dir
- Repo with no tags: https://github.com/refined-github/yolo

*/
