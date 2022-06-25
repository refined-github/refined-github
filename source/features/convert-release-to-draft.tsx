import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';
import * as api from '../github-helpers/api';
import LoadingIcon from '../github-helpers/icon-loading';

const editReleaseButtonSelector = [
	'.BtnGroup a[href*="releases/edit"]', // Before "Releases UI refresh" #4902
	'.Box-btn-octicon[aria-label="Edit"]',
].join(',');

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

		select(editReleaseButtonSelector)!.click(); // Visit "Edit release" page
	} catch (error: unknown) {
		draftButton.textContent = 'Error. Check console or retry';
		features.log.error(import.meta.url, error);
	}
}

async function init(signal: AbortSignal): Promise<void | false> {
	await api.expectToken();

	const editButton = await elementReady(editReleaseButtonSelector);
	if (!editButton || select.exists('.label-draft')) {
		return false;
	}

	const convertToDraftButton = (
		<button
			type="button"
			className={'btn rgh-convert-draft ' + (pageDetect.isEnterprise() ? 'BtnGroup-item' : 'btn-sm ml-3')}
		>
			Convert to draft
		</button>
	);

	if (pageDetect.isEnterprise()) { // Before "Releases UI refresh" #4902
		editButton.after(convertToDraftButton);
	} else {
		editButton.before(convertToDraftButton);
		// Fix spacing but avoid the two buttons sticking together
		editButton.classList.replace('ml-1', 'ml-0');
	}

	delegate(document, '.rgh-convert-draft', 'click', convertToDraft, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleTag,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
