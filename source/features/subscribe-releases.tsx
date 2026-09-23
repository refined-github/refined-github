import * as pageDetect from 'github-url-detection';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import showToast from '../github-helpers/toast.js';
import observe from '../helpers/selector-observer.js';
import SubscribeRelease from './subscribe-release.svelte';

async function subscribeRequest(repositoryId: string): Promise<void> {
	const form = new FormData();

	form.append('do', 'custom');
	form.append('repository_id', repositoryId);
	form.append('thread_types[]', 'Release');

	const response = await fetch(
		'https://github.com/notifications/subscribe',
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				'GitHub-Verified-Fetch': 'true',
			},
			body: form,
		},
	);

	if (!response.ok) {
		throw new Error(`GitHub returned ${response.status}`);
	}
}

async function subscribeToReleases(repositoryId: string): Promise<void> {
	await showToast(async () => subscribeRequest(repositoryId), {
		message: 'Subscribing to releases',
		doneMessage: 'Subscribed to releases',
	});
}

function addButton(releasesFilter: HTMLInputElement): void {
	const target = document.createElement('span');
	releasesFilter.form!.before(target);

	mount(SubscribeRelease, {
		target,
		props: {
			onSubscribe: subscribeToReleases,
		},
	});
}

function init(signal: AbortSignal): void {
	observe('input#release-filter', addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoHome,
	],
	requiresToken: true,
	init,
});

/*

Test URLs
https://github.com/refined-github/refined-github

*/
