import React from 'dom-chef';
import select from 'select-dom';
import {DownloadIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepo} from '../github-helpers';

function getDropdownItem(downloadUrl: URL): JSX.Element {
	return (
		<a className='dropdown-item rgh-download-folder' href={downloadUrl.href}>
			Download directory
		</a>
	);
}

function init(): void {
	const downloadUrl = new URL('https://download-directory.github.io/');
	downloadUrl.searchParams.set('url', location.href);

	const deleteButtons = select.all(`form[action^="/${getRepo()!.nameWithOwner}/tree/delete"]`);
	if (deleteButtons.length > 0) { // There are no buttons to delete the folder on "commit tree" pages #5335
		for (const deleteButton of deleteButtons) {
			deleteButton.before(getDropdownItem(downloadUrl));
		}

		return;
	}

	select('a.dropdown-item[data-hotkey="t"]')!.after(getDropdownItem(downloadUrl));
	select('a.btn[data-hotkey="t"]')!.after(
		<a
			className='btn d-none d-md-block tooltipped tooltipped-ne rgh-download-folder'
			aria-label='Download directory'
			href={downloadUrl.href}
		>
			<DownloadIcon/>
		</a>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isRepoRoot, // Already has an native download ZIP button
	],
	deduplicate: '.rgh-download-folder', // #3945
	init,
});
