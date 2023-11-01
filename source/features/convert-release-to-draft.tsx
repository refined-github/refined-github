import React from 'dom-chef';
import {$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate from 'delegate-it';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import showToast from '../github-helpers/toast.js';

const getReleaseEditLinkSelector = (): 'a' => `a[href^="/${getRepo()!.nameWithOwner}/releases/edit"]` as 'a';

async function convertToDraft(): Promise<void> {
	const tagName = location.pathname.split('/').pop()!;
	const release = await api.v3(`releases/tags/${tagName}`);
	await api.v3(release.url, {
		method: 'PATCH',
		body: {
			draft: true,
		},
	});

	$(getReleaseEditLinkSelector())!.click(); // Visit "Edit release" page
}

const confirmMessage = 'The release will be effectively deleted and a new draft will be created.';
const confirmMessageWithReactions = 'Existing user reactions will be lost.';
const confirmMessageQuestion = 'Continue?';

async function onConvertClick(): Promise<void> {
	const message = elementExists('.js-reaction-group-button')
		? [confirmMessage, confirmMessageWithReactions, confirmMessageQuestion]
		: [confirmMessage, confirmMessageQuestion];
	if (!confirm(message.join(' '))) {
		return;
	}

	try {
		await showToast(convertToDraft(), {message: 'Converting…', doneMessage: 'Redirecting…'});
	} catch (error) {
		features.log.error(import.meta.url, error);
	}
}

function attachButton(editButton: HTMLAnchorElement): void {
	if (elementExists('[title="Draft"]')) {
		return;
	}

	editButton.before(
		<button
			type="button"
			className="btn btn-sm ml-3 mr-1 rgh-convert-draft"
		>
			Convert to draft
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void | false> {
	await api.expectToken();

	observe(getReleaseEditLinkSelector(), attachButton, {signal});
	delegate('.rgh-convert-draft', 'click', onConvertClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleReleaseOrTag,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/releases/tag/23.7.25

*/
