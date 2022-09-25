import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import LoadingIcon from '../github-helpers/icon-loading';
import attachElement from '../helpers/attach-element';
import {getRepo} from '../github-helpers';

const getReleaseEditLinkSelector = (): string => `a[href^="/${getRepo()!.nameWithOwner}/releases/edit"]`;

async function convertToDraft({delegateTarget: draftButton}: DelegateEvent): Promise<void> {
	try {
		draftButton.append(<LoadingIcon className="ml-2 v-align-text-bottom" width={16}/>);

		const tagName = location.pathname.split('/').pop()!;
		const release = await api.v3(`releases/tags/${tagName}`);
		await api.v3(release.url, {
			method: 'PATCH',
			body: {
				draft: true,
			},
		});

		select(getReleaseEditLinkSelector())!.click(); // Visit "Edit release" page
	} catch (error) {
		draftButton.textContent = 'Error. Check console or retry';
		features.log.error(import.meta.url, error);
	}
}

async function init(signal: AbortSignal): Promise<void | false> {
	await api.expectToken();

	const editButton = await elementReady(getReleaseEditLinkSelector());
	if (!editButton || select.exists('.label-draft')) {
		return false;
	}

	// Fix spacing but avoid the two buttons sticking together
	editButton.classList.replace('ml-1', 'ml-0');

	attachElement(editButton, {
		before: () => (
			<button
				type="button"
				className={'btn rgh-convert-draft ' + (pageDetect.isEnterprise() ? 'BtnGroup-item' : 'btn-sm ml-3')}
			>
				Convert to draft
			</button>
		),
	});

	delegate(document, '.rgh-convert-draft', 'click', convertToDraft, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleTag,
	],
	awaitDomReady: false,
	deduplicate: '.rgh-convert-draft',
	init,
});
