import React from 'dom-chef';
import {$} from 'select-dom';
import InfoIcon from 'octicons-plain-react/Info';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import onPrMerge from '../github-events/on-pr-merge.js';
import featureLink from '../helpers/feature-link.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import matchesAnyPattern from '../helpers/matches-any-patterns.js';

const exceptions = [
	'dev',
	'develop',
	'development',
	'main',
	'master',
	'next',
	'pre',
	'prod',
	'stage',
	/production/,
	/^release\//,
	/^v\d/,
];

async function init(): Promise<void> {
	const deleteButton = $('[action$="/cleanup"] [type="submit"]');
	if (!deleteButton) {
		return;
	}

	if (matchesAnyPattern(getBranches().head.branch, exceptions)) {
		return;
	}

	deleteButton.dataset.disableWith = 'Auto-deleting…';
	deleteButton.click();

	const deletionEvent = await elementReady('.TimelineItem-body:has(.pull-request-ref-restore-text)', {
		stopOnDomReady: false,
		timeout: 2000,
	});

	const url = featureLink(features.getFeatureID(import.meta.url));
	deletionEvent!.append(
		<a className="d-inline-block" href={url}>via Refined GitHub <InfoIcon /></a>,
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isOpenPR,
		userHasPushAccess,
	],
	additionalListeners: [
		onPrMerge,
	],
	awaitDomReady: true, // TODO: Remove after https://github.com/refined-github/refined-github/issues/6566
	onlyAdditionalListeners: true,
	init,
});

/*

Test URLs:

1. Open https://github.com/pulls
2. Click on any PRs you can merge (in repositories without native auto-delete)
3. Merge the PR

*/
