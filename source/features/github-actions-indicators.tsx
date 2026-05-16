import {parseCron} from '@fregante/mi-cron';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import PlayIcon from 'octicons-plain-react/Play';
import {$, $optional} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {expectToken} from '../github-helpers/github-token.js';
import {cacheByRepo} from '../github-helpers/index.js';
import removeHashFromUrlBar from '../helpers/history.js';
import observe from '../helpers/selector-observer.js';
import {tooltipped} from '../helpers/tooltip.js';
import GetWorkflows from './github-actions-indicators.gql';

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
	const {repository} = await api.v4(GetWorkflows);

	// `workflowFiles` is null on empty repos like https://github.com/fregante/empty
	const workflows: any[] = repository.workflowFiles?.entries ?? [];

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
			// User can trigger the workflow
			const url = new URL(workflowLink.href);
			url.hash = 'rgh-run-workflow';
			workflowLink.after(
				tooltipped(
					{label: 'Trigger manually', direction: 'sw'},
					<a
						href={url.href}
						data-turbo-frame={workflowLink.dataset.turboFrame}
						// `actions-unpin-button` provides the hover style
						className="Button Button--iconOnly Button--invisible Button--medium color-bg-transparent actions-unpin-button"
					>
						<PlayIcon />
					</a>,
				),
			);
		} else {
			// User cannot trigger the workflow
			const indicator = tooltipped(
				{label: 'This workflow can be triggered manually', direction: 'sw'},
				<div
					className='ActionListItem-visual ActionListItem-visual--trailing'
					style={{pointerEvents: 'initial'}}
				>
					<PlayIcon />
				</div>,
			);
			const pinIcon = $optional('.ActionListItem-visual--trailing', workflowLink);
			if (pinIcon) {
				// Enable tooltip
				pinIcon.style.pointerEvents = 'auto';
				// Add spacing between the icons
				pinIcon.classList.add('gap-2');
				pinIcon.prepend(indicator);
			} else {
				workflowLink.append(indicator);
			}
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
