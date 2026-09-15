import './mark-locked.css';

import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import LockIcon from 'octicons-plain-react/Lock';
import {$, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getCleanPathname} from '../github-helpers/index.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';

const {class: featureClass} = getIdentifiers(import.meta.url);

function mark(link: HTMLAnchorElement): void {
	// The state icon is left untouched so the row still says issue/PR/draft/merged
	const icon = $('[class^="LeadingVisual"] .octicon', closestElement('li', link));
	const wrapper = icon.parentElement!;
	wrapper.classList.add(featureClass);
	// `span` wrapper: SVG ignores the `title` attribute, it only tooltips via a `<title>` child
	wrapper.append(
		<span title="Locked">
			<LockIcon width={12} height={12} />
		</span>,
	);
}

async function markLocked(links: HTMLAnchorElement[]): Promise<void> {
	const conversations = links.map(link => {
		const [owner, name, , number] = getCleanPathname(link).split('/', 4);
		const key = api.escapeKey(owner, name, number);
		return {
			key, link, owner, name, number,
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

https://github.com/refined-github/sandbox/issues?q=locked
https://github.com/refined-github/sandbox/pulls?q=locked
https://github.com/refined-github/sandbox/issues?q=long%20title (check together with `mark-pinned`)

*/
