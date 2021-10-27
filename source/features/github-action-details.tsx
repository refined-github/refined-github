import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import {PlayIcon} from '@primer/octicons-react';
import {parseCron} from '@cheap-glitch/mi-cron';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';

// eslint-disable-next-line import/prefer-default-export
export const getWorkflows = cache.function(async (): Promise<AnyObject[]> => {
	const {repository: {workflowFiles}} = await api.v4(`
		repository() {
			workflowFiles: object(expression: "HEAD:.github/workflows") {
				... on Tree {
					entries {
						object {
							... on Blob {
								text
							}
						}
					}
				}
			}
		}
	`);

	return workflowFiles?.entries ?? [];
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: () => 'workflows:' + getRepo()!.nameWithOwner,
});

interface WorkflowDetails {
	schedule?: string;
	dispatchable: boolean;
}

const getWorkflowsDetails = async (): Promise<Record<string, WorkflowDetails> | false> => {
	const workflows = await getWorkflows();
	if (workflows.length === 0) {
		return false;
	}

	const details: Record<string, WorkflowDetails> = {};
	for (const workflow of workflows) {
		const workflowYaml: string = workflow.object.text;
		const name = /^name[:\s'"]+([^'"\n]+)/m.exec(workflowYaml);
		if (!name) {
			continue;
		}

		const cron = /schedule[:\s-]+cron[:\s'"]+([^'"\n]+)/m.exec(workflowYaml);
		details[name[1]] = {
			schedule: cron?.[1] ?? undefined,
			dispatchable: workflowYaml.includes('workflow_dispatch:'),
		};
	}

	return details;
};

async function init(): Promise<false | void> {
	const workflows = await getWorkflowsDetails();
	if (!workflows) {
		return false;
	}

	// TODO [2022-05-01]: Remove `.hx_actions-sidebar` (kept for GHE)
	for (const workflowListItem of select.all('.filter-item[href*="/workflows/"]', await elementReady('.hx_actions-sidebar, .Layout-sidebar'))) {
		if (select.exists('.octicon-stop', workflowListItem)) {
			continue;
		}

		const workflowName = workflowListItem.textContent!.trim();
		const workflow = workflows[workflowName];
		if (!workflow) {
			continue;
		}

		if (workflow.dispatchable) {
			workflowListItem.append(<PlayIcon className="ml-1"/>);
			workflowListItem.parentElement!.classList.add('tooltipped', 'tooltipped-e');
			workflowListItem.parentElement!.setAttribute('aria-label', 'This workflow can be triggered manually');
		}

		if (workflow.schedule) {
			const nextTime = parseCron.nextDate(workflow.schedule);
			if (!nextTime) {
				continue;
			}

			const relativeTime = <relative-time datetime={nextTime.toString()}/>;
			workflowListItem.append(
				<em className={workflow.dispatchable ? 'ml-2' : ''}>
					(next {relativeTime})
				</em>,
			);
			setTimeout(() => { // The content of `relative-time` might not be immediately available
				workflowListItem.parentElement!.classList.add('tooltipped', 'tooltipped-e');
				workflowListItem.parentElement!.setAttribute('aria-label', (workflow.dispatchable ? 'This workflow can be triggered manually\n' : '') + 'Next ' + relativeTime.textContent!);
			}, 500);
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepositoryActions,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
