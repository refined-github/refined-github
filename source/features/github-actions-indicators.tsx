import {parseCron} from '@fregante/mi-cron';
import cx from 'clsx';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import PlayIcon from 'octicons-plain-react/Play';
import {$, $optional, closestElement} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import {withTooltipRef} from '../components/tooltip.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo} from '../github-helpers/index.js';
import removeHashFromUrlBar from '../helpers/history.js';
import observe from '../helpers/selector-observer.js';
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
				// Cannot find workflow YAML; workflow removed.
				continue;
			}

			const crons = [...workflowYaml.matchAll(/^(?: {4}|\t\t)-\s*cron[\s"':]+(?<cron>[^\n"']+)/gm)].map(match =>
				match.groups!.cron
			);
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
		// The pin button only exists if the user can run workflows, so only they get the play button
		const pinButton = $optional(
			'[data-component="ActionList.TrailingAction"] button',
			closestElement('li', workflowLink),
		);
		if (pinButton) {
			// Lay out the play and pin buttons side by side
			pinButton.parentElement!.classList.add('d-flex');
			const url = new URL(workflowLink.href);
			url.hash = 'rgh-run-workflow';
			pinButton.before(
				<a
					ref={withTooltipRef({label: 'Trigger manually', direction: 'sw'})}
					href={url.href}
					data-turbo-frame={workflowLink.dataset.turboFrame}
					// Reuse the pin button's (hashed) classes and attributes to match its style
					className={cx(pinButton.className, 'rounded-0')}
					data-component={pinButton.dataset.component}
					data-size={pinButton.dataset.size}
					data-variant={pinButton.dataset.variant}
					data-no-visuals={pinButton.dataset.noVisuals}
				>
					<PlayIcon />
				</a>,
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

	$('[class^="prc-ActionList-ItemLabel"]', workflowLink).append(
		' ',
		<em>
			(<relative-time datetime={String(nextTime)} />)
		</em>,
	);
}

async function init(signal: AbortSignal): Promise<false | void> {
	observe('a[class^="prc-ActionList-ActionListContent"]', addIndicators, {signal});
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
	requiresToken: true,
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

Manual (third party):
https://github.com/eslint/eslint/actions

Manual + scheduled:
https://github.com/sindresorhus/type-fest/actions/workflows/ts-canary.yml

Manual + disabled + pinned:
https://github.com/refined-github/sandbox/actions

*/
