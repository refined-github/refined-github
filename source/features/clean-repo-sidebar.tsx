import './clean-repo-sidebar.css';
import * as pageDetect from 'github-url-detection';
import {$optional, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {assertNodeContent} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

// The h2 is to avoid hiding website links that include '/releases' #4424
function cleanReleases(signal: AbortSignal): void {
	observe('[class*="PageLayout-Pane"] [class*="SidebarSection-module__sidebarSection"]:not(:has([data-component="SkeletonText"])) h2 a[href$="/releases"]', sidebarReleases => {
		const releasesSection = closestElement('[class*="SidebarSection-module__sidebarSection"]', sidebarReleases);
		if (
			// Hide the whole section if there's no releases
			!elementExists('.octicon-tag', releasesSection)
			// Don't hide the section if it has a "Create new release" link
			&& !elementExists('a[href$="releases/new"]', releasesSection)
		) {
			releasesSection.hidden = true;
		}
	}, {signal, once: true});
}

function hideLanguageHeader(signal: AbortSignal): void {
	observe("[class*='PageLayout-Pane'] [class*='SidebarSection-module__sidebarSection']:has([data-component='ProgressBar']) > h2", languageHeader => {
		assertNodeContent(languageHeader.firstChild, 'Languages');
		languageHeader.classList.add('sr-only');
	}, {signal, once: true});
}

function moveReportLink(signal: AbortSignal): void {
	observe("[class*='PageLayout-Pane'] [class*='SidebarSection-module__sidebarSection']:last-child:not(:has([data-component='SkeletonText']))", lastSection => {
		// Your own repos don't include this link
		const reportLink = $optional("[class*='PageLayout-Pane'] a[href^='/contact/report-content']")?.parentElement;
		if (reportLink) {
			lastSection.append(reportLink);
		}
	}, {signal, once: true});
}

async function init(): Promise<void> {
	document.documentElement.setAttribute('rgh-clean-repo-sidebar', '');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
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
