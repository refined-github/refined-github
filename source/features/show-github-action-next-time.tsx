import './show-github-action-next-time.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {parseCron} from '@cheap-glitch/mi-cron';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepoURL, getRepoGQL, getCurrentBranch} from '../github-helpers';

const getActionsSchedules = cache.function(async (): Promise<{[index: string]: string} | undefined> => {
	const {repository: {object: {entries: actions}}} = await api.v4(
		`repository(${getRepoGQL()}) {
			object(expression: "${getCurrentBranch()}:.github/workflows") {
				... on Tree {
					entries {
						object { ... on Blob { text } }
					}
				}
			}
		}
	`);

	if (!actions) {
		return undefined;
	}

	const schedules: {[index: string]: string} = {};
	for (const actionYaml of actions.map((action: {[index: string]: {[index: string]: string}}) => action.object.text)) {
		const name = /^name:\s+['"]?(.+)['"]?/m.exec(actionYaml);
		const cron = /^\s*-\scron:\s+['"](.+)['"]/m.exec(actionYaml);

		if (name && cron) {
			schedules[name[1]] = cron[1];
		}
	}

	return schedules;
}, {
	maxAge: {
		days: 1
	},
	cacheKey: () => __filebasename + ':' + getRepoURL()
});

async function init(): Promise<void> {
	const actionsSidebar = (await elementReady('.hx_actions-sidebar'))!;
	if (!actionsSidebar) {
		return;
	}

	const actionsSchedules = await getActionsSchedules();
	if (!actionsSchedules) {
		return;
	}

	const currentDate = new Date();
	for (const actionListItem of select.all('li:not(:first-child) > a', actionsSidebar)) {
		const actionName = actionListItem.textContent!.trim();
		if (!(actionName in actionsSchedules)) {
			continue;
		}

		const nextTime = parseCron.nextDate(actionsSchedules[actionName], currentDate);
		if (nextTime) {
			actionListItem.append(<span className="rgh-github-action-next-time">(next <relative-time datetime={nextTime.toString()}/>)</span>);
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Shows the next scheduled time of relevant GitHub Actions in the workflows sidebar.',
	screenshot: 'https://user-images.githubusercontent.com/46634000/94690232-2476a180-0330-11eb-99d7-e174bb762cea.png'
}, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init
});
