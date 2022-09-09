import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import observe from '../helpers/selector-observer';

async function bypass(detailsLink: HTMLAnchorElement): Promise<void> {
	const runId = pageDetect.isActionJobRun(detailsLink)
		? detailsLink.pathname.split('/').pop() // https://github.com/xojs/xo/runs/1104625522
		: new URLSearchParams(detailsLink.search).get('check_run_id'); // https://github.com/refined-github/refined-github/pull/3629/checks?check_run_id=1223857819
	if (!runId) {
		// Sometimes the URL doesn't point to Checks at all
		return;
	}

	const {details_url: detailsUrl} = await api.v3(`check-runs/${runId}`);
	if (!detailsUrl) {
		return;
	}

	const {pathname, search: queryString} = new URL(detailsUrl);
	if (detailsUrl.startsWith('https://github.com/') || (pathname === '/' && queryString === '')) { // Ignore links to GitHub repos or static product pages #3938
		return;
	}

	detailsLink.href = detailsUrl;
}

function init(signal: AbortSignal): void {
	// This selector excludes URLs that are already external
	// `location.origin` is for the status checks’ in the hovercard
	// TODO: Clarify/retest comment
	observe(`
		a:not([href="/apps/github-actions"]) ~ div a.status-actions:is(
			[href^="${location.origin}"],
			[href^="/"]
		)`,

	/* @ts-expect-error https://github.com/g-plane/typed-query-selector/issues/26 */
	bypass,
	{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		pageDetect.isEmptyRepo,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
