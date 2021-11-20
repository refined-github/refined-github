import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';

const uselessDetailsLinks = new Set([
	'https://codecov.io', // https://github.com/sindresorhus/eslint-plugin-unicorn/pull/1088
	'https://github.com/jusx/mergeable', // https://github.com/mergeability/mergeable/pull/519
	'https://github.com/marketplace/wip', // https://github.com/InsightSoftwareConsortium/ITK/pull/2881
	'https://github.com/apps/kwrobot-v1',
]);

async function bypass(detailsLink: HTMLAnchorElement): Promise<void> {
	const runId = pageDetect.isActionJobRun(detailsLink)
		? detailsLink.pathname.split('/').pop() // https://github.com/xojs/xo/runs/1104625522
		: new URLSearchParams(detailsLink.search).get('check_run_id'); // https://github.com/refined-github/refined-github/pull/3629/checks?check_run_id=1223857819
	if (!runId) {
		// Sometimes the URL doesn't point to Checks at all
		return;
	}

	const directLink = await api.v3(`check-runs/${runId}`);
	if (!uselessDetailsLinks.has(directLink.details_url)) { // #3938
		detailsLink.href = directLink.details_url;
	}
}

function init(): void {
	// This selector excludes URLs that are already external
	const thirdPartyApps = [
		`a:not([href="/apps/github-actions"]) ~ div .status-actions[href^="${location.origin}"]:not(.rgh-bypass-link)`, // Hovercard status checks
		'a:not([href="/apps/github-actions"]) ~ div .status-actions[href^="/"]:not(.rgh-bypass-link)',
	].join(',');

	observe(thirdPartyApps, {
		constructor: HTMLAnchorElement,
		add(thirdPartyApp) {
			thirdPartyApp.classList.add('rgh-bypass-link');
			void bypass(thirdPartyApp);
		},
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	init: onetime(init),
});
