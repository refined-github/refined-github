import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {ZapIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import attachElement from '../helpers/attach-element';
import featureLink from '../helpers/feature-link';
import TimelineItem from '../github-helpers/timeline-item';

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

function deleteBranch(_: unknown, observer: MutationObserver): void {
	const deleteButton = select('[action$="/cleanup"] [type="submit"]');
	if (!deleteButton) {
		return;
	}

	deleteButton.dataset.disableWith = 'Auto-deleting…';
	deleteButton.click();
	observer.disconnect();

	attachElement({
		anchor: '#issue-comment-box',
		position: 'before',
		getNewElement: getBanner,
	});
}

function init(): Deinit {
	const observer = new MutationObserver(deleteBranch);

	const subscription = delegate(document, '.js-merge-commit-button', 'click', () => {
		subscription.destroy();
		observer.observe(select('.discussion-timeline-actions')!, {childList: true});
	});

	return [
		observer,
		subscription,
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
