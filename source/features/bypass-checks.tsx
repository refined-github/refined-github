import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import fetchDom from '../libs/fetch-dom';

async function init(): Promise<void> {
	// This selector excludes URLs that are already external
	const thirdPartyApps = select.all<HTMLAnchorElement>('a:not([href="/apps/github-actions"]) ~ div .status-actions[href^="/"]');

	// If anything errors, RGH will display the error next to the feature name
	await Promise.all(thirdPartyApps.map(bypass));
}

async function bypass(detailsLink: HTMLAnchorElement): Promise<void> {
	const directLink = await fetchDom<HTMLAnchorElement>(
		detailsLink.href,
		'[data-hydro-click*="check_suite.external_click"]'
	);
	detailsLink.href = directLink!.href;
}

features.add({
	id: __filebasename,
	description: 'Bypasses the "Checks" interstitial when clicking the "Details" links on a PR Checks added by third-party services like Travis.',
	screenshot: 'https://user-images.githubusercontent.com/2103975/49071220-c6596e80-f22d-11e8-8a1e-bdcd62aa6ece.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	init
});
