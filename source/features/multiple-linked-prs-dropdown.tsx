import './multiple-linked-prs-dropdown.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {buildRepoURL, getRepo} from '../github-helpers';

const getLinkedPRs = cache.function(async (issueNumber: string): Promise<number[]> => {
	const {search} = await api.v4(`
		search(type: ISSUE, first: 10, query: "repo:${getRepo()!.nameWithOwner} linked:issue in:body #${issueNumber}") {
			nodes {
				...on PullRequest { number }
			}
		}
	`);

	return search?.nodes.map((pr: {number: number}) => pr.number) ?? [];
}, {
	maxAge: {days: 7},
	cacheKey: ([issueNumber]) => `linked-prs:${getRepo()!.nameWithOwner}:${issueNumber}`,
});

const getLinkedIssues = cache.function(async (prNumber: string): Promise<number[]> => {
	const {repository} = await api.v4(`
		repository() {
			pullRequest(number: ${prNumber}) {
				closingIssuesReferences(first: 10) {
					nodes { number }
				}
			}
		}
	`);

	return repository?.pullRequest.closingIssuesReferences?.nodes.map((issue: {number: number}) => issue.number) ?? [];
}, {
	maxAge: {days: 7},
	cacheKey: ([prNumber]) => `linked-issues:${getRepo()!.nameWithOwner}:${prNumber}`,
});

function getDropdown(marker: Element, numbers: number[]): JSX.Element {
	return (
		<details className="dropdown details-reset details-overlay rgh-multiple-linked-prs-dropdown">
			<summary
				className="pb-2"
				aria-haspopup="menu"
				role="button"
			>
				{marker.cloneNode(true)}
				<span className="dropdown-caret color-text-secondary"/>
			</summary>
			<ul
				className="dropdown-menu dropdown-menu-sw width-auto"
				role="menu"
			>
				{numbers.map(number => (
					<li
						className="issue-link js-issue-link tooltipped tooltipped-w"
						data-error-text="Failed to load PR title"
						data-permission-text="PR title is private"
						data-url={buildRepoURL('issues', number)}
						data-id={`rgh-linked-${number}`}
					>
						<a
							className="dropdown-item"
							role="menuitem"
							href={buildRepoURL(pageDetect.isRepoIssueList() ? 'pull' : 'issues', number)}
							data-pjax="#js-repo-pjax-container"
						>
							#{number}
						</a>
					</li>
				))}
			</ul>
		</details>
	);
}

async function init(): Promise<void> {
	const multipleLinksMarkers = select.all(`[aria-label="Issues"] .tooltipped[aria-label$="linked ${pageDetect.isRepoIssueList() ? 'pull requests' : 'issues'}"]`);
	for (const marker of multipleLinksMarkers) {
		const number = marker.closest('.js-issue-row')!.id.slice(6);
		// eslint-disable-next-line no-await-in-loop
		const linkedNumbers = await (pageDetect.isRepoIssueList() ? getLinkedPRs(number) : getLinkedIssues(number));

		// Ensure we have the correct number of linked PRs for each issue, as the API search method is not perfectly reliable
		if (pageDetect.isRepoPRList() || marker.getAttribute('aria-label')!.startsWith(`${linkedNumbers.length} `)) {
			marker.replaceWith(getDropdown(marker, linkedNumbers));
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoConversationList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
