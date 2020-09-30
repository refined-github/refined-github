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

const getWorkflows = cache.function(async (): Promise<Array<{[index: string]: {[index: string]: string}}>> => {
	const {repository: {object: {entries: workflows}}} = await api.v4(
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

	return workflows;
}, {
	maxAge: {
		days: 1
	},
	cacheKey: () => __filebasename + ':' + getRepoURL()
});

function parseYamls(yamls: string[]): {[index: string]: string} {
	return Object.fromEntries(yamls
		.map(yaml => [(/^name:\s+(\S+)$/m.exec(yaml) ?? [])[1], (/^\s*-\scron:\s+['"](.+)['"]/m.exec(yaml) ?? [])[1]])
		.filter(([name, cron]) => name !== undefined && cron !== undefined)
	);
}

async function init(): Promise<void> {
	const actionsSidebar = (await elementReady('.hx_actions-sidebar'))!;
	if (actionsSidebar) {
		const currentDate = new Date();
		const workflows = await getWorkflows();
		if (workflows) {
			const actionsSchedules = parseYamls(workflows.map(workflow => workflow.object.text));
			for (const actionListItem of select.all('li > a', actionsSidebar).slice(1)) {
				const actionName = actionListItem.textContent!.trim();
				if (actionName in actionsSchedules) {
					const nextTime = parseCron.nextDate(actionsSchedules[actionName], currentDate);
					if (nextTime) {
						actionListItem.append(<span className="rgh-github-action-next-time">(next <relative-time datetime={nextTime.toString()}/>)</span>);
					}
				}
			}
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
