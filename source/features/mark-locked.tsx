import './mark-locked.css';

import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import LockIcon from 'octicons-plain-react/Lock';
import {$, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getCleanPathname} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function mark(link: HTMLAnchorElement): void {
	// The state icon is left untouched so the row still says issue/PR/draft/merged
	const icon = $('[class^="LeadingVisual"] .octicon', closestElement('li', link));
	const wrapper = icon.parentElement!;
	wrapper.classList.add('rgh-mark-locked');
	// `span` wrapper: SVG ignores the `title` attribute, it only tooltips via a `<title>` child
	wrapper.append(
		<span title="Locked">
			<LockIcon width={12} height={12} />
		</span>,
	);
}

async function markLocked(links: HTMLAnchorElement[]): Promise<void> {
	const conversations = links.map(link => {
		const number = getCleanPathname(link).split('/').pop()!;
		return {key: api.escapeKey(number), link, number};
	});

	const {repository} = await api.v4(`
		repository() {
			${
		conversations.map(({key, number}) => `
					${key}: issueOrPullRequest(number: ${number}) {
						... on Lockable {
							locked
						}
					}
				`).join('\n')
	}
		}
	`);

	for (const conversation of conversations) {
		if (repository[conversation.key].locked) {
			mark(conversation.link);
		}
	}
}

function init(signal: AbortSignal): void {
	observe(
		[
			// Issue list, which also includes PRs
			'a[data-testid="issue-pr-title-link"]',
			// PR list. `data-hovercard-type` excludes the repo links that share this `data-testid`
			'a[data-hovercard-type="pull_request"][data-testid="listitem-title-link"]',
		],
		batchedFunction(markLocked, {delay: 100}),
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues?q=locked
https://github.com/refined-github/sandbox/pulls?q=locked
https://github.com/refined-github/sandbox/issues?q=long%20title (check together with `mark-pinned`)

*/
