import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {GitPullRequestDraftIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import LoadingIcon from '../github-helpers/icon-loading';

const editReleaseButtonSelector = '.BtnGroup a[href*="releases/edit"], .Box-btn-octicon[aria-label="Edit"]';

async function convertToDraft({delegateTarget: draftButton}: delegate.Event): Promise<void> {
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
		features.log.error(__filebasename, error);
	}
}

async function init(): Promise<void | false> {
	await api.expectToken();

	const editButton = await elementReady(editReleaseButtonSelector);
	if (!editButton || select.exists('.label-draft')) {
		return false;
	}

	editButton.after(pageDetect.isEnterprise()
		? <button type="button" className="btn BtnGroup-item rgh-convert-draft">Convert to draft</button>
		: <button type="button" className="btn-octicon Box-btn-octicon ml-0 rgh-convert-draft"><GitPullRequestDraftIcon/></button>, // Releases UI refresh #4902
	);
	delegate(document, '.rgh-convert-draft', 'click', convertToDraft);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleTag,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
