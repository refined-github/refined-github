import React from 'dom-chef';

import * as pageDetect from 'github-url-detection';

import {ArrowLeftIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';

async function getPullRequestNumber(user: string, repository: string, runDatabaseId: string): Promise<number | false> {
	const {resource} = await api.v4(`
		query getPullRequestNumber($resource: URI!) {
			resource(url: $resource) {
				... on WorkflowRun {
					event
					checkSuite {
						matchingPullRequests(last: 1) {
							edges {
								node {
									number
								}
							}
						}
					}
				}
			}
		}
	`, {
		variables: {
			resource: `/${user}/${repository}/actions/runs/${runDatabaseId}`,
		},
	});

	if (resource.event !== 'pull_request') {
		return false;
	}

	const {edges} = resource.checkSuite.matchingPullRequests;
	if (edges.length === 0) {
		return false;
	}

	return edges[0].node.number;
}

async function add(contextBar: HTMLDivElement): Promise<void> {
	const url = new URL(location.href);
	if (typeof url.searchParams.get('pr') === 'string') {
		return;
	}

	const paths = url.pathname.split('/').slice(1);
	const prNumber = await getPullRequestNumber(paths[0], paths[1], paths[4]);

	if (!prNumber) {
		return;
	}

	contextBar.classList.add('flex-column', 'flex-items-start');
	contextBar.append(
		<span className="PageHeader-parentLink">
			<a href={`/${paths[0]}/${paths[1]}/pull/${prNumber}`} data-view-component="true">
				<ArrowLeftIcon size={16}/>
				<span className="PageHeader-parentLink-label">{`Back to pull request #${prNumber}`}</span>
			</a>
		</span>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('page-header>div.PageHeader-contextBar', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isActionRun,
	],
	init,
});
