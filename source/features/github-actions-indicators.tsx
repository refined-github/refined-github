import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import {AlertIcon, PlayIcon} from '@primer/octicons-react';
import {parseCron} from '@cheap-glitch/mi-cron';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import {cacheByRepo, getRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';

type WorkflowState = 'active' | 'disabled_manually';

type WorkflowDetails = {
	schedule?: string;
	manuallyDispatchable: boolean;
	state: WorkflowState;
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

const getWorkflows = async (): Promise<Workflow[]> => {
	const response = await api.v3(`/repos/${getRepo()!.owner}/${getRepo()!.name}/actions/workflows`);
	return response.workflows as Workflow[];
};

const getWorkflowYamls = async (): Promise<Record<string, string>> => {
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

	const workflows: [any] = workflowFiles?.entries ?? [];

	const result: Record<string, string> = {};
	for (const workflow of workflows) {
		result[workflow.name] = workflow.object.text;
	}

	return result;
};

const getWorkflowsDetails = cache.function('workflows', async (): Promise<Record<string, WorkflowDetails> | false> => {
	const workflows = await getWorkflows();

	if (workflows.length === 0) {
		return false;
	}

	const workflowYamls = await getWorkflowYamls();

	if (Object.keys(workflowYamls).length === 0) {
		return false;
	}

	const details: Record<string, WorkflowDetails> = {};

	for (const workflow of workflows) {
		const workflowName = workflow.path.split('/').pop()!;
		const workflowYaml = workflowYamls[workflowName];
		const cron = /schedule[:\s-]+cron[:\s'"]+([^'"\n]+)/m.exec(workflowYaml);

		details[workflowName] = {
			schedule: cron?.[1],
			manuallyDispatchable: workflowYaml.includes('workflow_dispatch:'),
			state: workflow.state,
		};
	}

	return details;
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: cacheByRepo,
});

async function addIndicators(workflowListItem: HTMLAnchorElement): Promise<void> {
	// Memoized above
	const workflows = await getWorkflowsDetails();
	if (!workflows) {
		return; // Impossibru, for types only
	}

	if (select.exists('.octicon-stop', workflowListItem)) {
		return;
	}

	const workflowName = workflowListItem.href.split('/').pop()!;
	const workflow = workflows[workflowName];
	if (!workflow) {
		return;
	}

	const svgTrailer = <div className="ActionListItem-visual--trailing m-auto d-flex gap-2"/>;
	workflowListItem.append(svgTrailer);

	if (workflow.state === WorkflowState.DisabledManually) {
		svgTrailer.append(<AlertIcon className="m-auto"/>);
		addTooltip(workflowListItem, 'This workflow was disabled manually');
	}

	if (workflow.manuallyDispatchable) {
		svgTrailer.append(<PlayIcon className="m-auto"/>);
		addTooltip(workflowListItem, 'This workflow can be triggered manually');
	}

	if (!workflow.schedule) {
		return;
	}

	const nextTime = parseCron.nextDate(workflow.schedule);
	if (!nextTime) {
		return;
	}

	const relativeTime = <relative-time datetime={String(nextTime)}/>;
	select('.ActionList-item-label', workflowListItem)!.append(
		<em>
			({relativeTime})
		</em>,
	);

	setTimeout(() => {
		// The content of `relative-time` might is not immediately available
		addTooltip(workflowListItem, `Next run: ${relativeTime.shadowRoot!.textContent!}`);
	}, 500);
}

async function init(signal: AbortSignal): Promise<false | void> {
	// Do it as soon as possible, before the page loads
	const workflows = await getWorkflowsDetails();
	if (!workflows) {
		return false;
	}

	observe('a.ActionList-content', addIndicators, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepositoryActions,
	],
	init,
});

/*

## Test URLs

Manual:
https://github.com/fregante/browser-extension-template/actions

Manual + scheduled:
https://github.com/fregante/eslint-formatters/actions

Manually disabled:
https://github.com/134130/134130/actions

*/
