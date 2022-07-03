import React from 'dom-chef';
import select from 'select-dom';
import {ZapIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onPrMerge from '../github-events/on-pr-merge';
import featureLink from '../helpers/feature-link';
import TimelineItem from '../github-helpers/timeline-item';
import attachElement from '../helpers/attach-element';
import {canEditEveryComment} from './quick-comment-edit';

// TODO: Not an exact match; Moderators can edit comments but not create releases
const canCreateRelease = canEditEveryComment;

function getBanner(): JSX.Element {
	const url = featureLink(features.getFeatureID(import.meta.url));

	return (
		<TimelineItem>
			<div className="flash">
				<span>The head branch was automatically deleted by Refined GitHub</span>
				<a href={url} className="btn btn-sm flash-action">
					<ZapIcon/> See feature
				</a>
			</div>
		</TimelineItem>
	);
}

function init(): void {
	const deleteButton = select('[action$="/cleanup"] [type="submit"]');
	if (!deleteButton) {
		return;
	}

	deleteButton.dataset.disableWith = 'Auto-deleting…';
	deleteButton.click();

	attachElement({
		anchor: '#issue-comment-box',
		position: 'before',
		getNewElement: getBanner,
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
	onlyAdditionalListeners: true,
	init,
});
