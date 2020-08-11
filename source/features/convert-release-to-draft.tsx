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
		await api.expectToken();
		draftButton.textContent = 'Converting...';
		draftButton.append(<LoadingIcon className="ml-2" width={16}/>);

		const tagName = location.pathname.split('/').pop()!;
		const {id: releaseID}: Record<string, number> = await api.v3(`repos/${getRepoURL()}/releases/tags/${tagName}`);
		const response = await api.v3(`repos/${getRepoURL()}/releases/${releaseID}`, {
			method: 'PATCH',
			body: {
				draft: true
			}
		});

		location.pathname = [getRepoURL(), 'releases', 'edit', response.tag_name].join('/');
	} catch (error) {
		draftButton.textContent = 'Convert Failed! See console for details';
		throw error;
	}
}

function init(): void | false {
	const editButton = select('.BtnGroup a[href*="releases/edit"]')!;
	if (!editButton || select.exists('.label-draft')) {
		return false;
	}

	editButton.after(<a className="btn BtnGroup-item text-orange rgh-convert-draft">Convert to draft</a>);
	delegate(document, '.rgh-convert-draft', 'click', convertToDraft);
}

void features.add({
	id: __filebasename,
	description: 'Adds a button next to a single release to cover it to a draft.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/89732990-767e0380-da20-11ea-8ac5-b617701eeb29.png'
}, {
	include: [
		pageDetect.isSingleTag
	],
	init
});
