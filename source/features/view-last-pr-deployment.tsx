import React from 'dom-chef';
import {lastElement} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {RocketIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function addLink(header: HTMLElement): void {
	const lastDeployment = lastElement('.js-timeline-item a[title="Deployment has completed"]');
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
			<RocketIcon className="mr-1 v-align-text-top"/>
			Latest deployment
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
	awaitDomReady: true, // Must select last item on the page
	init,
});

// TODO: Needs a URL with multiple deployments and deactivated deployments
/*
Test URLs:
https://github.com/fregante/bundle/pull/2
*/
