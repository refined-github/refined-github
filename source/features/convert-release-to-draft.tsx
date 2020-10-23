import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import LoadingIcon from '../github-helpers/icon-loading';

async function convertToDraft({delegateTarget: draftButton}: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	try {
		draftButton.append(<LoadingIcon className="ml-2 v-align-text-bottom" width={16}/>);

		const tagName = location.pathname.split('/').pop()!;
		const release = await api.v3(`/releases/tags/${tagName}`);
		await api.v3(release.url, {
			method: 'PATCH',
			body: {
				draft: true
			}
		});

		select('.BtnGroup a[href*="releases/edit"]')!.click(); // Visit "Edit release" page
	} catch (error: unknown) {
		draftButton.textContent = 'Error. Check console or retry';
		features.error(__filebasename, error);
	}
}

async function init(): Promise<void | false> {
	await api.expectToken();

	const editButton = select('.BtnGroup a[href*="releases/edit"]');
	if (!editButton || select.exists('.label-draft')) {
		return false;
	}

	editButton.after(<button type="button" className="btn BtnGroup-item rgh-convert-draft">Convert to draft</button>);
	delegate(document, '.rgh-convert-draft', 'click', convertToDraft);
}

void features.add({
	id: __filebasename,
	description: 'Adds a button to convert a release to draft.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/90017455-8e03f900-dc79-11ea-95c5-377e0a82d4ea.png'
}, {
	include: [
		pageDetect.isSingleTag
	],
	init
});
