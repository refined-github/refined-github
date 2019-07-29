import './edit-files-faster.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {wrap} from '../libs/dom-utils';
import getDefaultBranch from '../libs/get-default-branch';

async function init(): Promise<void> {
	const defaultBranch = await getDefaultBranch();
	for (const fileIcon of select.all('.files :not(a) > .octicon-file')) {
		const pathnameParts = fileIcon
			.closest('tr')!
			.querySelector<HTMLAnchorElement>('.js-navigation-open')!
			.pathname
			.split('/');

		pathnameParts[3] = 'edit'; // Replaces `/blob/`

		const isPermalink = /Tag|Tree/.test(select('.branch-select-menu i')!.textContent!);
		if (isPermalink) {
			pathnameParts[4] = defaultBranch; // Replaces /${tag|commit}/
		}

		wrap(fileIcon, <a href={pathnameParts.join('/')} className="rgh-edit-files-faster" />);
		fileIcon.after(icons.edit());
	}
}

features.add({
	id: __featureName__,
	description: 'Edit files straight from a repo’s file list by clicking their file icon',
	include: [
		features.isRepoTree
	],
	load: features.onFileListUpdate,
	init
});
