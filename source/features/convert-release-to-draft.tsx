import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import LoadingIcon from '../github-helpers/icon-loading';
import {getRepoURL} from '../github-helpers';

async function convertToDraft({delegateTarget: draftButton}: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	try {
		draftButton.textContent = 'Converting…';
		draftButton.append(<LoadingIcon className="ml-2" width={16}/>);

		const tagName = location.pathname.split('/').pop()!;
		const {id: releaseID} = await api.v3(`repos/${getRepoURL()}/releases/tags/${tagName}`);
		const response = await api.v3(`repos/${getRepoURL()}/releases/${releaseID as string}`, {
			method: 'PATCH',
			body: {
				draft: true
			}
		});

		location.pathname = [getRepoURL(), 'releases', 'edit', response.tag_name].join('/');
	} catch (error) {
		draftButton.textContent = 'Error. Open console or retry';
		features.error(__filebasename, error);
	}
}

async function init(): Promise<void | false> {
	await api.expectToken();

	const editButton = select('.BtnGroup a[href*="releases/edit"]')!;
	if (!editButton || select.exists('.label-draft')) {
		return false;
	}

	editButton.after(<a className="btn BtnGroup-item rgh-convert-draft">Convert to draft</a>);
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
