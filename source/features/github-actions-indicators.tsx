import {CachedFunction} from 'webext-storage-cache';
import React from 'dom-chef';
import {$, elementExists} from 'select-dom';
import {StopIcon, PlayIcon} from '@primer/octicons-react';
import {parseCron} from '@cheap-glitch/mi-cron';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import GetWorkflows from './github-actions-indicators.gql';

type Workflow = {
	name: string;
	isEnabled: boolean;
};

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

// There is no way to get a workflow list in the v4 API #6543
async function getWorkflows(): Promise<Workflow[]> {
	const response = await api.v3('actions/workflows');

	const workflows = response.workflows as any[];

	// The response is not reliable: Some workflow's path is '' and deleted workflow's state is 'active'
	return workflows
		.map<Workflow>(workflow => ({
		name: workflow.path.split('/').pop()!,
		isEnabled: workflow.state === 'active',
	}));
}

async function getFilesInWorkflowPath(): Promise<Record<string, string>> {
	const {repository: {workflowFiles}} = await api.v4(GetWorkflows);

	const workflows: any[] = workflowFiles?.entries ?? [];

	const result: Record<string, string> = {};
	for (const workflow of workflows) {
		result[workflow.name] = workflow.object.text;
	}

	return result;
}

const workflowDetails = new CachedFunction('workflows-details', {
	async updater(): Promise<Record<string, Workflow & WorkflowDetails>> {
		const [workflows, workflowFiles] = await Promise.all([getWorkflows(), getFilesInWorkflowPath()]);

		const details: Record<string, Workflow & WorkflowDetails> = {};

		for (const workflow of workflows) {
			const workflowYaml = workflowFiles[workflow.name];

			if (workflowYaml === undefined) {
			// Cannot find workflow yaml; workflow removed.
				continue;
			}

			const cron = /schedule[:\s-]+cron[:\s'"]+([^'"\n]+)/m.exec(workflowYaml);

			details[workflow.name] = {
				...workflow,
				schedule: cron?.[1],
				manuallyDispatchable: workflowYaml.includes('workflow_dispatch:'),
			};
		}

		return details;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: cacheByRepo,
});

async function addIndicators(workflowListItem: HTMLAnchorElement): Promise<void> {
	// There might be a disabled indicator already
	if (elementExists('.octicon-stop', workflowListItem)) {
		return;
	}

	// Called in `init`, memoized
	const workflows = await workflowDetails.get();
	const workflowName = workflowListItem.href.split('/').pop()!;
	const workflow = workflows[workflowName];
	if (!workflow) {
		return;
	}

	const svgTrailer = <div className="ActionListItem-visual--trailing m-auto d-flex gap-2"/>;
	workflowListItem.append(svgTrailer);

	if (!workflow.isEnabled) {
		svgTrailer.append(<StopIcon className="m-auto"/>);
		addTooltip(workflowListItem, 'This workflow is not enabled');
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
	$('.ActionList-item-label', workflowListItem)!.append(
		<em>
			({relativeTime})
		</em>,
	);

	setTimeout(() => {
		// The content of `relative-time` might is not immediately available
		addTooltip(workflowListItem, `Next run: ${relativeTime.shadowRoot!.textContent}`);
	}, 500);
}

async function init(signal: AbortSignal): Promise<false | void> {
	observe('a.ActionList-content', addIndicators, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepositoryActions,
		async () => Boolean(await workflowDetails.get()),
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
