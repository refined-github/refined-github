import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
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

const getScheduledWorkflows = async (): Promise<Record<string, string> | false> => {
	const workflows = await getWorkflows();
	if (workflows.length === 0) {
		return false;
	}

	const schedules: Record<string, string> = {};
	for (const workflow of workflows) {
		const workflowYaml: string = workflow.object.text;
		const name = /^name[:\s'"]+([^'"\n]+)/m.exec(workflowYaml);
		const cron = /schedule[:\s-]+cron[:\s'"]+([^'"\n]+)/m.exec(workflowYaml);

		if (name && cron) {
			schedules[name[1]] = cron[1];
		}
	}

	return schedules;
};

async function init(): Promise<false | void> {
	const workflows = await getScheduledWorkflows();
	if (!workflows) {
		return false;
	}

	for (const workflowListItem of select.all('.filter-item[href*="/workflows/"]', await elementReady('.hx_actions-sidebar'))) {
		if (select.exists('.octicon-stop', workflowListItem)) {
			continue;
		}

		const workflowName = workflowListItem.textContent!.trim();
		if (!(workflowName in workflows)) {
			continue;
		}

		const nextTime = parseCron.nextDate(workflows[workflowName]);
		if (nextTime) {
			const relativeTime = <relative-time datetime={nextTime.toString()}/>;
			workflowListItem.append(<em>(next {relativeTime})</em>);
			setTimeout(() => { // The content of `relative-time` might not be immediately available
				workflowListItem.parentElement!.classList.add('tooltipped', 'tooltipped-e');
				workflowListItem.parentElement!.setAttribute('aria-label', 'Next ' + relativeTime.textContent!);
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
