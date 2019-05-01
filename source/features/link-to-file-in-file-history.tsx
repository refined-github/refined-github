/**
This feature adds direct link to file/directory when viewing the history.
GitHub provides a link but it points to the root of the repo which is not that helpful.

See it in action at https://github.com/sindresorhus/refined-github/commits/master/readme.md
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';
import {file} from '../libs/icons';
import {groupButtons} from '../libs/group-buttons';

function init(): void {
	const {repoName} = getOwnerAndRepo();

	const pathToFile = select('.breadcrumb')!.textContent!.trim().replace(new RegExp(`^History for ${repoName}`), '');

	for (const commitLinkCell of select.all<HTMLDivElement>('.commit-links-cell')) {
		const fileAnchor = (
			<a
				href={`${select<HTMLAnchorElement>('.commit-links-group a.btn', commitLinkCell)!.pathname.replace('/commit/', '/blob/')}${pathToFile}`}
				className="btn btn-outline tooltipped tooltipped-sw"
				aria-label="Browse the file at this point in the history"
				rel="nofollow"
			>
				{file()}
			</a>
		);

		select('.commit-links-group + a.btn', commitLinkCell)!.before(fileAnchor);
		commitLinkCell.classList.add('width-md-auto', 'width-sm-auto');
		groupButtons([fileAnchor, fileAnchor.nextElementSibling!]);
	}
}

features.add({
	id: 'link-to-file-in-file-history',
	include: [
		features.isHistoryPage
	],
	load: features.onAjaxedPages,
	init
});
