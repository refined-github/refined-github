import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate from 'delegate-it';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';
import showToast from '../github-helpers/toast';

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

	select(getReleaseEditLinkSelector())!.click(); // Visit "Edit release" page
}

async function onConvertClick(): Promise<void> {
	try {
		await showToast(convertToDraft(), {message: 'Converting…', doneMessage: 'Redirecting…'});
	} catch (error) {
		features.log.error(import.meta.url, error);
	}
}

function attachButton(editButton: HTMLAnchorElement): void {
	if (select.exists('[title="Draft"]')) {
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
	delegate(document, '.rgh-convert-draft', 'click', onConvertClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleTag,
	],
	awaitDomReady: false,
	init,
});
