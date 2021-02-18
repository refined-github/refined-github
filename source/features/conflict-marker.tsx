import './conflict-marker.css';
import React from 'dom-chef';
import select from 'select-dom';
import {AlertIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';

interface PRConfig {
	number: string;
	user: string;
	repo: string;
	link: HTMLAnchorElement;
	key: string;
}

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
	return prs.map(createQueryFragment).join('\n');
}

function getPRConfig(prIcon: Element): PRConfig {
	const link = prIcon.closest('.js-navigation-item')!.querySelector('a.js-navigation-open')!;
	const [, user, repo, , number] = link.pathname.split('/');
	return {
		user,
		repo,
		number,
		link,
		key: api.escapeKey(`${user}_${repo}_${number}`)
	};
}

async function init(): Promise<false | void> {
	const openPrIcons = select.all('.js-issue-row .octicon-git-pull-request.open');
	if (openPrIcons.length === 0) {
		return false;
	}

	const prs = openPrIcons.map(getPRConfig);
	const data = await api.v4(buildQuery(prs));

	for (const pr of prs) {
		if (data[pr.key].pullRequest.mergeable === 'CONFLICTING') {
			pr.link.after(
				<a
					className="rgh-conflict-marker tooltipped tooltipped-e m-0 text-gray mr-1"
					aria-label="This PR has conflicts that must be resolved"
					href={`${pr.link.pathname}#partial-pull-merging`}
				>
					<AlertIcon/>
				</a>
			);
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversationList
	],
	init
});
