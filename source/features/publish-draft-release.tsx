import delegate from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getRepo} from '../github-helpers/index.js';
import showToast from '../github-helpers/toast.js';
import observe from '../helpers/selector-observer.js';

const getReleaseEditLinkSelector = (): 'a' => `a[href^="/${getRepo()!.nameWithOwner}/releases/edit"]` as 'a';

async function getCurrentDraftRelease(): Promise<AnyObject | undefined> {
	// Drafts have no tag yet, so they can't be fetched via `releases/tags/:tag`.
	// Find the draft whose page matches the one we're on instead.
	for await (const page of api.v3paginated('releases')) {
		const release = (page as unknown as AnyObject[]).find(candidate =>
			candidate.draft && new URL(candidate.html_url).pathname === location.pathname,
		);
		if (release) {
			return release;
		}
	}

	return undefined;
}

async function publishRelease(): Promise<void> {
	const release = await getCurrentDraftRelease();
	if (!release) {
		throw new Error('Could not find the draft release for this page');
	}

	const published = await api.v3(release.url, {
		method: 'PATCH',
		body: {
			draft: false,
		},
	});

	location.assign(published.html_url as string); // Visit the published release
}

async function onPublishClick(): Promise<void> {
	if (!confirm('Publish this release? It will become public and watchers will be notified.')) {
		return;
	}

	await showToast(publishRelease(), {
		message: 'Publishing…',
		doneMessage: 'Redirecting…',
	});
}

function attachButton(editButton: HTMLAnchorElement): void {
	if (!elementExists('[title="Draft"]')) {
		return; // Only draft releases can be published
	}

	editButton.before(
		<button
			type="button"
			className="Button Button--secondary Button--small ml-3 tmp-ml-3 mr-1 tmp-mr-1 rgh-publish-draft"
		>
			Publish release
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe(getReleaseEditLinkSelector(), attachButton, {signal});
	delegate('.rgh-publish-draft', 'click', onPublishClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleReleaseOrTag,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

Draft releases are private, so a draft must exist in a repo you have push access to.
The page looks like: https://github.com/$user/$repo/releases/tag/untagged-0000000000000000

*/
