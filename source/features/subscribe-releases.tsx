import {$, closestElement} from 'select-dom';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';
import showToast from '../github-helpers/toast.js';
import observe from '../helpers/selector-observer.js';
import SubscribeRelease from './subscribe-releases.svelte';

async function subscribeRequest(repositoryId: string, threadTypes: string[]): Promise<void> {
	const form = new FormData();

	form.append('do', 'custom');
	form.append('repository_id', repositoryId);

	for (const type of new Set([...threadTypes, 'Release'])) {
		form.append('thread_types[]', type);
	}

	const response = await fetch(
		'https://github.com/notifications/subscribe',
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				'GitHub-Verified-Fetch': 'true',
				'X-Requested-With': 'XMLHttpRequest',
			},
			body: form,
		},
	);

	if (!response.ok) {
		throw new Error(`GitHub returned ${response.status}`);
	}
}

async function subscribeToReleases(repositoryId: string, threadTypes: string[]): Promise<void> {
	await showToast(async () => subscribeRequest(repositoryId, threadTypes), {
		message: 'Subscribing to releases',
		doneMessage: 'Subscribed to releases',
	});
}

function getRepositoryId(): string {
	return $('meta[name="hovercard-subject-tag"]', document).content.split(':', 2)[1];
}

function addButton(releasesFilter: HTMLInputElement): void {
	const target = closestElement('.d-flex', releasesFilter);
	target.classList.add('flex-items-start');

	mount(SubscribeRelease, {
		target,
		anchor: target.firstElementChild!,
		props: {
			repositoryId: getRepositoryId(),
			onSubscribe: subscribeToReleases,
		},
	});
}

function init(signal: AbortSignal): void {
	observe('input#release-filter', addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		// Only first page of Releases
		() => getRepo()?.path === 'releases',
	],
	// The feature uses GitHub's own cookies
	// requiresToken: true,
	init,
});

/*

Test URLs
https://github.com/refined-github/refined-github/releases

*/
