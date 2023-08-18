import './conflict-marker.css';
import React from 'dom-chef';
import select from 'select-dom';
import {AlertIcon} from '@primer/octicons-react';
import oneMutation from 'one-mutation';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from "../helpers/selector-observer.js";

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

function buildQuery(prs: PRConfig[]): string {
	return prs.map(pr => createQueryFragment(pr)).join('\n');
}

function getPRConfig(prIcon: Element): PRConfig {
	const link = prIcon.closest('.js-navigation-item')!.querySelector('a.js-navigation-open')!;
	const [, user, repo, , number] = link.pathname.split('/');
	return {
		user,
		repo,
		number,
		link,
		key: api.escapeKey(user, repo, number),
	};
}

async function init(): Promise<false | void> {
	// Milestone issues are lazy-loaded
	if (pageDetect.isMilestone()) {
		// TODO: Use observe instead
		await oneMutation(select('.js-milestone-issues-container')!, {childList: true});
	}

	const openPrIcons = select.all('.js-issue-row .octicon-git-pull-request.color-fg-open');
	if (openPrIcons.length === 0) {
		return false;
	}

	const prs = openPrIcons.map(icon => getPRConfig(icon));
	const data = await api.v4(buildQuery(prs));

	for (const pr of prs) {
		if (data[pr.key].pullRequest.mergeable === 'CONFLICTING') {
			pr.link.after(
				<a
					className="rgh-conflict-marker tooltipped tooltipped-e color-fg-muted ml-2"
					aria-label="This PR has conflicts that must be resolved"
					href={`${pr.link.pathname}#partial-pull-merging`}
				>
					<AlertIcon className="v-align-middle"/>
				</a>,
			);
		}
	}
}

function getPRConfig2(link: HTMLAnchorElement): PRConfig {
	const [, user, repo, , number] = link.pathname.split('/');
	return {user, repo, number, link, key: api.escapeKey(user, repo, number)};
}

async function addConflictMarker(link: HTMLAnchorElement): Promise<void> {
	const prConfig = getPRConfig2(link);
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
