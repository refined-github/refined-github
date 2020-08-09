import React from 'dom-chef';
import delay from 'delay';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import LoadingIcon from '../github-helpers/icon-loading';
import {getRepoURL, getRepoGQL} from '../github-helpers';

const getReleaseID = async (): Promise<string> => {
	const tagName = location.pathname.split('/').pop()!;
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			release(tagName: "${tagName}") {
				id
			}
		}
	`);

	// => atob(repository.release.id) => "07:Release27300592"
	return atob(repository.release.id).replace(/.*Release/,'');
};

async function convertToDraft({delegateTarget: draftButton}: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void | false> {
	draftButton.textContent = 'Converting...';
	draftButton.append(<LoadingIcon className="ml-2" width={16}/>);

	const releaseID = await getReleaseID();
	const response = await api.v3(`repos/${getRepoURL()}/releases/${releaseID}`, {
		method: 'PATCH',
		body: {
			draft: true
		}
	});

	if (!response.ok) {
		draftButton.textContent = 'Convert Failed! See console for details';
		return;
	}

	draftButton.textContent = 'Success';
	// Allow the user to see that it was successful
	await delay(500);

	location.href = response.html_url;
}

function init(): void | false {
	const editButton = select('.BtnGroup a[href*="releases/edit"]')!;
	if (!editButton || select.exists('.label-draft')) {
		return false;
	}

	editButton.after(
		<a
			className="btn BtnGroup-item text-orange rgh-convert-draft"
		>
			Convert to draft
		</a>);

	delegate(document, '.rgh-convert-draft', 'click', convertToDraft);
}

void features.add({
	id: __filebasename,
	description: 'Adds a button next to a single release to cover it to a draft.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/89732990-767e0380-da20-11ea-8ac5-b617701eeb29.png'
}, {
	include: [
		pageDetect.isReleasesOrTags
	],
	init
});
