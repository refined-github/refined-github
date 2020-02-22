import './repo-wide-file-finder.css';
import React from 'dom-chef';
import features from '../libs/features';
import select from 'select-dom';
import {getRepoURL} from '../libs/utils';

function init(): void {
	const pageHeaderElement = select<HTMLUListElement>('.pagehead-actions');
	const fileFinderButtonExists = select.exists('[data-hotkey="t"]');
	const hiddenButton: HTMLElement = (
		<li className="rgh-file-finder-hidden-btn">
			<a
				className="btn btn-sm empty-icon float-right BtnGroup-item"
				data-hotkey="t"
				data-pjax="true"
				href={`/${getRepoURL()}/find/master`}
			>
				Hidden Find
			</a>
		</li>
	);
	if (!fileFinderButtonExists) {
    pageHeaderElement?.appendChild(hiddenButton);
	}
}

function deinit(): void {
	const pageHeaderElement = select<HTMLUListElement>('.pagehead-actions');
	const hiddenButton = select<HTMLLIElement>('.rgh-file-finder-hidden-btn');

	if (hiddenButton) {
    pageHeaderElement?.removeChild(hiddenButton);
	}
}

features.add({
	id: __featureName__,
	description: 'Enables file finder on `t` on pages other than code tree',
	screenshot: false,
	include: [
		features.isRepo
	],
	exclude: [
		features.isRepoRoot,
		features.isRepoTree,
		features.isSingleFile,
		features.isFileFinder
	],
	load: features.onAjaxedPages,
	init,
	deinit
});
