import React from 'dom-chef';
import {$} from 'select-dom';
import InfoIcon from 'octicons-plain-react/Info';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import onPrMerge from '../github-events/on-pr-merge.js';
import featureLink from '../helpers/feature-link.js';
import attachElement from '../helpers/attach-element.js';
import {canEditEveryComment} from './quick-comment-edit.js';

// TODO: Not an exact match; Moderators can edit comments but not create releases
const canCreateRelease = canEditEveryComment;

async function init(): Promise<void> {
	const deleteButton = $('[action$="/cleanup"] [type="submit"]');
	if (!deleteButton) {
		return;
	}

	deleteButton.dataset.disableWith = 'Auto-deleting…';
	deleteButton.click();

	const deletionEvent = await elementReady('[data-test-selector="head-ref-deleted-event-ref-name"]', {
		stopOnDomReady: false,
	});

	attachElement(deletionEvent!.closest('.TimelineItem-body'), {
		append() {
			const url = featureLink(features.getFeatureID(import.meta.url));
			return <a className="d-inline-block" href={url}>via Refined GitHub <InfoIcon/></a>;
		},
	});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isOpenPR,
		canCreateRelease,
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
