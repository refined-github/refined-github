import {CachedFunction} from 'webext-storage-cache';
import React from 'dom-chef';
import {$} from 'select-dom/strict.js';
import PlayIcon from 'octicons-plain-react/Play';
import {parseCron} from '@fregante/mi-cron';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import GetWorkflows from './github-actions-indicators.gql';
import {expectToken} from '../github-helpers/github-token.js';
import removeHashFromUrlBar from '../helpers/history.js';

type Workflow = {
	name: string;
	isEnabled: boolean;
};

type WorkflowDetails = {
	schedules: string[];
	manuallyDispatchable: boolean;
};

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

			const crons = [...workflowYaml.matchAll(/^(?: {4}|\t\t)-\s*cron[:\s'"]+([^'"\n]+)/gm)].map(match => match[1]);
			details[workflow.name] = {
				...workflow,
				schedules: crons,
				manuallyDispatchable: workflowYaml.includes('workflow_dispatch:'),
			};
		}

		return details;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: cacheByRepo,
});

async function addIndicators(workflowLink: HTMLAnchorElement): Promise<void> {
	// Called in `init`, memoized
	const workflows = await workflowDetails.get();
	const workflowName = workflowLink.href.split('/').pop()!;
	const workflow = workflows[workflowName];
	if (!workflow) {
		return;
	}

	if (workflow.manuallyDispatchable && workflowLink.pathname !== location.pathname) {
		if (workflowLink.nextElementSibling) {
			const url = new URL(workflowLink.href);
			url.hash = 'rgh-run-workflow';
			workflowLink.after(
				<a
					href={url.href}
					data-turbo-frame={workflowLink.dataset.turboFrame}
					// `actions-unpin-button` provides the hover style
					className="tooltipped tooltipped-sw Button Button--iconOnly Button--invisible Button--medium color-bg-transparent actions-unpin-button"
					aria-label="Trigger manually"
				>
					<PlayIcon />
				</a>,
			);
		} else {
			// This class keeps the action on a single line. It natively exists if the item can be pinned (if current user has write access)
			workflowLink.parentElement!.classList.add('ActionListItem--withActions');
			workflowLink.after(
				<div
					className="tooltipped tooltipped-sw Button Button--iconOnly Button--invisible Button--medium color-bg-transparent"
					aria-label="This workflow can be triggered manually"
				>
					<PlayIcon />
				</div>,
			);
		}
	}

	let nextTime: Date | undefined;
	for (const schedule of workflow.schedules) {
		const time = parseCron.nextDate(schedule);
		if (time && (!nextTime || time < nextTime)) {
			nextTime = time;
		}
	}

	if (!nextTime) {
		return;
	}

	$('.ActionListItem-label', workflowLink).append(
		<em>
			(<relative-time datetime={String(nextTime)} />)
		</em>,
	);
}

async function init(signal: AbortSignal): Promise<false | void> {
	await expectToken();
	observe('a.ActionListContent', addIndicators, {signal});
}

function openRunWorkflow(): void {
	removeHashFromUrlBar();
	// Note that the attribute is removed after the first opening, so the selector only matches it once
	const dropdown = $('details[data-deferred-details-content-url*="/actions/manual?workflow="]');
	dropdown.open = true;
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepositoryActions,
		async () => Boolean(await workflowDetails.get()),
	],
	init,
}, {
	include: [
		() => location.hash === '#rgh-run-workflow',
	],
	awaitDomReady: true,
	init: openRunWorkflow,
});

/*

## Test URLs

Manual + scheduled:
https://github.com/sindresorhus/type-fest/actions/workflows/ts-canary.yml

Manual + disabled + pinned:
https://github.com/refined-github/sandbox/actions

*/
