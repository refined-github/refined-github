import './conflict-marker.css';
import React from 'dom-chef';
import {AlertIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from "../helpers/selector-observer.js";

// TODO: Remove type
type PRConfig = {
	number: string;
	user: string;
	repo: string;
	link: HTMLAnchorElement;
	key: string;
};

// TODO: seperate gql
function createQueryFragment(pr: PRConfig): string {
	return `
		${pr.key}: repository(owner: "${pr.user}", name: "${pr.repo}") {
			pullRequest(number: ${pr.number}) {
				mergeable
			}
		}
	`;
}

function getPRConfig(link: HTMLAnchorElement): PRConfig {
	const [, user, repo, , number] = link.pathname.split('/');
	return {user, repo, number, link, key: api.escapeKey(user, repo, number)};
}

async function addConflictMarker(link: HTMLAnchorElement): Promise<void> {
	const prConfig = getPRConfig(link);
	const data = await api.v4(createQueryFragment(prConfig));

	if (data[prConfig.key].pullRequest.mergeable === 'CONFLICTING') {
		prConfig.link.after(
			<a
				className="rgh-conflict-marker tooltipped tooltipped-e color-fg-muted ml-2"
				aria-label="This PR has conflicts that must be resolved"
				href={`${prConfig.link.pathname}#partial-pull-merging`}
			>
				<AlertIcon className="v-align-middle"/>
			</a>,
		);
	}
}

function init2(signal: AbortSignal): void {
	observe('.js-issue-row:has(.octicon-git-pull-request.color-fg-open) a.js-navigation-open', addConflictMarker, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	exclude: [
		pageDetect.isGlobalIssueOrPRList,
		pageDetect.isBlank,
	],
	init: init2,
}, {
	include: [
		pageDetect.isGlobalIssueOrPRList,
	],
	exclude: [
		pageDetect.isBlank,
	],
	init: init2,
});

/** Test urls
 *
 */
