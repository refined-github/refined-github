import './edit-files-faster.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {wrap} from '../libs/dom-utils';

function init(): void {
	for (const fileIcon of select.all('.files :not(a) > .octicon-file')) {
		const pathnameParts = fileIcon
			.closest('tr')!
			.querySelector<HTMLAnchorElement>('.js-navigation-open')!
			.pathname
			.split('/');

		pathnameParts[3] = 'edit'; // Replaces `/blob/`

		wrap(fileIcon, <a href={pathnameParts.join('/')} className="rgh-edit-files-faster" />);
		fileIcon.after(icons.edit());
	}
}

features.add({
	id: 'edit-files-faster',
	description: 'Edit files straight from a repo’s file list by clicking their file icon',
	include: [
		features.isRepoTree
	],
	load: features.onFileListUpdate,
	init
});
