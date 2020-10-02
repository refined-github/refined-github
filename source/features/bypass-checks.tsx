import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';

async function bypass(detailsLink: HTMLAnchorElement): Promise<void> {
	const directLink = await fetchDom<HTMLAnchorElement>(
		detailsLink.href,
		'[data-hydro-click*="check_suite.external_click"]'
	);

	if (directLink) {
		detailsLink.href = directLink.href;
	}
}

async function init(): Promise<void> {
	// This selector excludes URLs that are already external
	const thirdPartyApps = [
		`a:not([href="/apps/github-actions"]) ~ div .status-actions[href^="${location.origin}"]:not(.rgh-bypass-link)`, // Hovercard status checks
		'a:not([href="/apps/github-actions"]) ~ div .status-actions[href^="/"]:not(.rgh-bypass-link)'
	].join();

	observe(thirdPartyApps, {
		constructor: HTMLAnchorElement,
		add(thirdPartyApp) {
			thirdPartyApp.classList.add('rgh-bypass-link');
			void bypass(thirdPartyApp);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Bypasses the "Checks" interstitial when clicking the "Details" links on a PR Checks added by third-party services like Travis.',
	screenshot: 'https://user-images.githubusercontent.com/2103975/49071220-c6596e80-f22d-11e8-8a1e-bdcd62aa6ece.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	init: onetime(init)
});
