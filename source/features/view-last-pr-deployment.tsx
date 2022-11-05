import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function addLink(header: HTMLElement): void {
	const lastDeployment = select.last('.js-timeline-item a[title="Deployment has completed"]');
	if (!lastDeployment) {
		return;
	}

	header.prepend(
		<a
			className="rgh-last-deployment btn btn-sm d-none d-md-block mr-1"
			target="_blank" // Matches GitHub’s own behavior
			rel="noopener noreferrer"
			href={lastDeployment.href}
		>
			<LinkExternalIcon className="mr-1 v-align-text-top"/>
			Last deployment
		</a>,
	);
}

function init(signal: AbortSignal): void {
	observe('.gh-header-actions', addLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});

// TODO: Needs a URL with multiple deployments and deactivated deployments
/*
Test URLs:
https://github.com/fregante/bundle/pull/2
*/
