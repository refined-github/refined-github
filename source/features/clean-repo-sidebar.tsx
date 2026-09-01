import './clean-repo-sidebar.css';
import * as pageDetect from 'github-url-detection';
import {$, $optional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {assertNodeContent} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

function cleanSidebarSection(section: HTMLElement): void {
	// The h2 is to avoid hiding website links that include '/releases' #4424
	// Hide the whole section if there's no releases, unless it has a "Create new release" link
	if (elementExists('h2 a[href$="/releases"]', section) && !elementExists(['.octicon-tag', 'a[href$="releases/new"]'], section)) {
		section.hidden = true;
		return;
	}

	const languageHeader = $optional(':scope > h2', section);
	if (languageHeader && elementExists('[data-component="ProgressBar"]', section)) {
		assertNodeContent(languageHeader.firstChild, 'Languages');
		languageHeader.classList.add('sr-only');
		return;
	}

	const emptyMeta = $optional('[class*="SidebarAbout-module__noDescription"]', section);
	if (emptyMeta && !pageDetect.canUserAccessRepoSettings()) {
		emptyMeta.remove();
		// Don't return here because the next condition applies to the same block
	}

	// Your own repos don't include this link
	const reportLink = $optional('a[href^="/contact/report-content"]', section);
	if (reportLink) {
		$('[class*="PageLayout-Pane"] [class*="SidebarSection-module__sidebarSection"]:last-child').append(reportLink.parentElement!);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	document.documentElement.setAttribute('rgh-clean-repo-sidebar', '');

	observe('[class*="PageLayout-Pane"] [class*="SidebarSection-module__sidebarSection"]', cleanSidebarSection, {signal});
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
- Repo with no description: https://github.com/shadcn/Ant

*/
