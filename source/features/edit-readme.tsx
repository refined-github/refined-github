import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

async function init(): Promise<void | false> {
	const readmeHeader = select('#readme .Box-header h3');
	if (!readmeHeader) {
		return false;
	}

	// The button already exists on repos you can push to.
	if (select.exists('a[aria-label="Edit this file"]')) {
		return false;
	}

	const filename = readmeHeader.textContent!.trim();
	const pathnameParts = select<HTMLAnchorElement>(`.files [title="${filename}"]`)!.pathname.split('/');
	pathnameParts[3] = 'edit'; // Replaces /blob/

	readmeHeader.after(
		<a href={pathnameParts.join('/')}
			className="Box-btn-octicon btn-octicon float-right"
			aria-label="Edit this file">
			{icons.edit()}
		</a>
	);
}

features.add({
	id: __featureName__,
	description: 'Quickly edit a repository’s README when previewed in a directory',
	include: [
		features.isRepoTree
	],
	load: features.onAjaxedPages,
	init
});
