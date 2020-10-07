import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {parseCron} from '@cheap-glitch/mi-cron';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepoURL, getRepoGQL} from '../github-helpers';

const getScheduledWorkflows = cache.function(async (): Promise<Record<string, string> | false> => {
	const {repository: {object: {entries: workflows}}} = await api.v4(`
		repository(${getRepoGQL()}) {
			object(expression: "HEAD:.github/workflows") {
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
	if (!workflows) {
		return false;
	}

	const schedules: Record<string, string> = {};
	for (const workflow of workflows) {
		const workflowYaml = workflow.object.text;
		const name = /^name[:\s'"]+(.+)['"]?/m.exec(workflowYaml);
		const cron = /schedule[:\s-]+cron[:\s'"]+(.+)['"]/m.exec(workflowYaml);

		if (name && cron) {
			schedules[name[1]] = cron[1];
		}
	}

	return schedules;
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: () => __filebasename + ':' + getRepoURL()
});

async function init(): Promise<false | void> {
	const workflows = await getScheduledWorkflows();
	if (!workflows) {
		return false;
	}

	for (const workflowListItem of select.all('[href*="?query"]', await elementReady('.hx_actions-sidebar'))) {
		const workflowName = workflowListItem.textContent!.trim();
		if (!(workflowName in workflows)) {
			continue;
		}

		const nextTime = parseCron.nextDate(workflows[workflowName]);
		if (nextTime) {
			workflowListItem.append(<em>(next <relative-time datetime={nextTime.toString()}/>)</em>);
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Shows the next scheduled time of relevant GitHub Actions in the workflows sidebar.',
	screenshot: 'https://user-images.githubusercontent.com/46634000/94690232-2476a180-0330-11eb-99d7-e174bb762cea.png'
}, {
	include: [
		pageDetect.isRepositoryActions
	],
	awaitDomReady: false,
	init
});
