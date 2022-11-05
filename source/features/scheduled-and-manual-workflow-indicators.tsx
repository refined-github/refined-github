import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import {PlayIcon} from '@primer/octicons-react';
import {parseCron} from '@cheap-glitch/mi-cron';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';

type WorkflowDetails = {
	schedule?: string;
	manuallyDispatchable: boolean;
};

function addTooltip(element: HTMLElement, tooltip: string): void {
	const existingTooltip = element.getAttribute('aria-label');
	if (existingTooltip) {
		element.setAttribute('aria-label', existingTooltip + '.\n' + tooltip);
	} else {
		element.classList.add('tooltipped', 'tooltipped-s');
		element.setAttribute('aria-label', tooltip);
	}
}

const getWorkflowsDetails = cache.function(async (): Promise<Record<string, WorkflowDetails> | false> => {
	const {repository: {workflowFiles}} = await api.v4(`
		repository() {
			workflowFiles: object(expression: "HEAD:.github/workflows") {
				... on Tree {
					entries {
						name
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

	const workflows = workflowFiles?.entries ?? [];
	if (workflows.length === 0) {
		return false;
	}

	const details: Record<string, WorkflowDetails> = {};
	for (const workflow of workflows) {
		const workflowYaml: string = workflow.object.text;
		const cron = /schedule[:\s-]+cron[:\s'"]+([^'"\n]+)/m.exec(workflowYaml);
		details[workflow.name] = {
			schedule: cron?.[1],
			manuallyDispatchable: workflowYaml.includes('workflow_dispatch:'),
		};
	}

	return details;
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: () => 'workflows:' + getRepo()!.nameWithOwner,
});

async function init(): Promise<false | void> {
	const workflows = await getWorkflowsDetails();
	if (!workflows) {
		return false;
	}

	const workflowsSidebar = await elementReady('.ActionList');
	for (const workflowListItem of select.all('a.ActionList-content[href*="/workflows/"]', workflowsSidebar)) {
		if (select.exists('.octicon-stop', workflowListItem)) {
			continue;
		}

		const workflowName = workflowListItem.href.split('/').pop()!;
		const workflow = workflows[workflowName];
		if (!workflow) {
			continue;
		}

		if (workflow.manuallyDispatchable) {
			workflowListItem.append(<PlayIcon className="ActionListItem-visual--trailing m-auto"/>);
			addTooltip(workflowListItem, 'This workflow can be triggered manually');
		}

		if (workflow.schedule) {
			const nextTime = parseCron.nextDate(workflow.schedule);
			if (!nextTime) {
				continue;
			}

			const relativeTime = <relative-time datetime={String(nextTime)}/>;
			select('.ActionList-item-label', workflowListItem)!.append(
				<em>
					(next {relativeTime})
				</em>,
			);
			setTimeout(() => {
				// The content of `relative-time` might not be immediately available
				addTooltip(workflowListItem, 'Next run in ' + relativeTime.textContent!);
			}, 500);
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepositoryActions,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});

/*

## Test URLs

Manual:
https://github.com/fregante/browser-extension-template/actions

Manual + scheduled:
https://github.com/fregante/eslint-formatters/actions

*/
