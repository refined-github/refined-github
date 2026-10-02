import * as pageDetect from 'github-url-detection';
import GitMergeQueueIcon from 'octicons-plain-react/GitMergeQueue';
import {CachedFunction} from 'webext-storage-cache';

import {addTab, removeTab} from '../components/extensible-nav-store.js';
import features from '../feature-manager.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {buildRepoUrl} from '../github-helpers/index.js';

const queueExists = new CachedFunction('merge-queue-exists', {
	async updater(url: string): Promise<boolean> {
		const response = await fetch(url, {method: 'HEAD'});
		if (response.status === 404) {
			return false;
		}

		if (response.status !== 200 || response.redirected) {
			throw new Error(`Could not check merge queue: HTTP ${response.status}`);
		}

		return true;
	},
	maxAge: {hours: 1},
});

let currentHref: string | undefined;
let generation = 0;

async function init(signal: AbortSignal): Promise<false | void> {
	const currentGeneration = ++generation;
	const branch = await getDefaultBranch();
	if (generation !== currentGeneration || signal.aborted) {
		return false;
	}

	const encodedBranch = branch.split('/').map(part => encodeURIComponent(part)).join('/');
	const href = buildRepoUrl('queue', encodedBranch);
	const exists = await queueExists.get(href);
	if (generation !== currentGeneration || signal.aborted) {
		return false;
	}

	if (!exists) {
		if (currentHref) {
			removeTab('rgh-merge-queue');
			currentHref = undefined;
		}

		return false;
	}

	if (currentHref === href) {
		return;
	}

	addTab({
		id: 'rgh-merge-queue',
		href,
		label: 'Merge queue',
		icon: GitMergeQueueIcon,
		selected: () => location.pathname === new URL(href).pathname,
	}, 'actions');
	currentHref = href;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*

Test URLs:

- Queue enabled: https://github.com/github/docs
- No queue: https://github.com/refined-github/refined-github

*/
