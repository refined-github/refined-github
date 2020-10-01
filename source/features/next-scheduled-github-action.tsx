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
	const {repository: {object: {entries: workflow}}} = await api.v4(`
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
	if (!actions) {
		return false;
	}

	const schedules: Record<string, string> = {};
	for (const action of actions) {
		const actionYaml = action.object.text;
		const name = /^name:\s+['"]?(.+)['"]?/m.exec(actionYaml);
		const cron = /^\s*-\scron:\s+['"](.+)['"]/m.exec(actionYaml);

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
	const actionsSchedules = await getActionsSchedules();
	if (!actionsSchedules) {
		return false;
	}

	for (const actionListItem of select.all('[href*="?query"]', await elementReady('.hx_actions-sidebar'))) {
		const actionName = actionListItem.textContent!.trim();
		if (!(actionName in actionsSchedules)) {
			continue;
		}

		const nextTime = parseCron.nextDate(actionsSchedules[actionName]);
		if (nextTime) {
			actionListItem.append(<em>(next <relative-time datetime={nextTime.toString()}/>)</em>);
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
	exclude: [
		pageDetect.isNewAction
	],
	awaitDomReady: false,
	init
});
