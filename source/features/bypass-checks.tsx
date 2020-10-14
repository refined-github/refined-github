import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import octokit from '../github-helpers/octokit';
import {getRepositoryInfo} from '../github-helpers';

async function bypass(detailsLink: HTMLAnchorElement): Promise<void> {
	const runId = pageDetect.isActionJobRun(detailsLink) ?
		detailsLink.pathname.split('/').pop() : // https://github.com/xojs/xo/runs/1104625522
		new URLSearchParams(detailsLink.search).get('check_run_id'); // https://github.com/sindresorhus/refined-github/pull/3629/checks?check_run_id=1223857819
	if (!runId) {
		// Sometimes the URL doesn't point to Checks at all
		return;
	}

	const {owner, name: repo} = getRepositoryInfo();
	const check_run_id = Number.parseInt(runId, 10);
	if (!owner || !repo || !check_run_id) {
		return;
	}

	const {data} = await octokit.checks.get({owner, repo, check_run_id});
	detailsLink.href = data.details_url;
}

function init(): void {
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
