import './mark-locked-issues-in-lists.css';

import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import LockIcon from 'octicons-plain-react/Lock';
import {$, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';

const {class: featureClass} = getIdentifiers(import.meta.url);
const badgeClass = `${featureClass}-badge`;

const stateIcons = [
	'.octicon-issue-opened',
	'.octicon-issue-closed',
	'.octicon-skip',
	'.octicon-git-pull-request',
	'.octicon-git-pull-request-closed',
	'.octicon-git-pull-request-draft',
	'.octicon-git-merge',
];

function mark(link: HTMLAnchorElement): void {
	// The state icon is left untouched so the row still says issue/PR/draft/merged
	const icon = $(stateIcons, closestElement('li', link));
	const wrapper = icon.parentElement!;
	wrapper.classList.add(featureClass);
	// `span` wrapper: SVG ignores the `title` attribute, it only tooltips via a `<title>` child
	wrapper.append(
		<span className={badgeClass} title="Locked">
			<LockIcon width={12} height={12} />
		</span>,
	);
}

async function markLocked(links: HTMLAnchorElement[]): Promise<void> {
	const conversations = links.map(link => {
		const [, owner, name, , number] = link.pathname.split('/', 5);
		const key = api.escapeKey(owner, name, number);
		return {
			key,
			link,
			owner,
			name,
			number: Number(number),
		};
	});

	// Batch queries cannot be exported to .gql files
	const batchQuery = conversations.map(({key, owner, name, number}) => `
		${key}: repository(owner: "${owner}", name: "${name}") {
			issueOrPullRequest(number: ${number}) {
				... on Lockable {
					locked
				}
			}
		}
	`).join('\n');

	const data = await api.v4(batchQuery);

	for (const conversation of conversations) {
		if (data[conversation.key].issueOrPullRequest!.locked) {
			mark(conversation.link);
		}
	}
}

function init(signal: AbortSignal): void {
	observe([
		// Issue list, which also includes PRs
		'a[data-testid="issue-pr-title-link"]',
		// PR list. `data-hovercard-type` excludes the repo links that share this `data-testid`
		'a[data-hovercard-type="pull_request"][data-testid="listitem-title-link"]',
	], batchedFunction(markLocked, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

Issues 134-136 and PRs 137-140 are locked, the other rows in these lists aren't:

- Issue list: https://github.com/refined-github/sandbox/issues?q=sort%3Acreated-desc&page=2
- PR list: https://github.com/refined-github/sandbox/pulls?q=is%3Apr+cross-deleted-pr-branches

The global lists are not supported: /pulls redirects to /pulls/inbox and /issues to /issues/assigned,
neither of which uses these selectors.

*/
