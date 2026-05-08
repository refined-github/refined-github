import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import RocketIcon from 'octicons-plain-react/Rocket';
import {lastElementOptional} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function addLink(header: HTMLElement): void {
	const lastDeployment = lastElementOptional('.js-timeline-item a[title="Deployment has completed"]');
	if (!lastDeployment) {
		return;
	}

	// Use "parentElement" because open PRs have a "PR status" button before the "Code" button
	header.parentElement!.prepend(
		<a
			className="rgh-last-deployment btn d-none d-md-block tooltipped tooltipped-s"
			aria-label="View last deployment"
			target="_blank" // Matches GitHub’s own behavior
			rel="noopener noreferrer"
			href={lastDeployment.href}
		>
			<RocketIcon/>
		</a>,
	);
}

function init(signal: AbortSignal): void {
	observe([
		'button[class*="PullRequestCodeButton"]',
		'.gh-header-actions > :first-child', // TODO: Drop in September 2026
	], addLink, {signal});
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
