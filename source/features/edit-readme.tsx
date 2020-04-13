import React from 'dom-chef';
import select from 'select-dom';
import pencilIcon from 'octicon/pencil.svg';
import features from '../libs/features';
import getDefaultBranch from '../libs/get-default-branch';

async function init(): Promise<void | false> {
	const readmeHeader = select('#readme .Box-header h2');
	if (!readmeHeader) {
		return false;
	}

	const isPermalink = /Tag|Tree/.test(select('.branch-select-menu i')!.textContent!);

	const filename = readmeHeader.textContent!.trim();
	const pathnameParts = select<HTMLAnchorElement>(`.files [title="${filename}"]`)!.pathname.split('/');
	pathnameParts[3] = 'edit'; // Replaces /blob/
	if (isPermalink) {
		pathnameParts[4] = await getDefaultBranch(); // Replaces /${tag|commit}/
	}

	// The button already exists on repos you can push to.
	const buttonExists = select<HTMLAnchorElement>('a[aria-label="Edit this file"]');
	if (buttonExists) {
		// See https://github.com/sindresorhus/refined-github/issues/2997: Fixes GitHub’s own "Edit readme" link on tag pages
		if (isPermalink) {
			buttonExists.href = pathnameParts.join('/');
		}

		return false;
	}

	readmeHeader.after(
		<a
			href={pathnameParts.join('/')}
			className="Box-btn-octicon btn-octicon float-right"
			aria-label="Edit this file"
		>
			{pencilIcon()}
		</a>
	);
}

features.add({
	id: __featureName__,
	description: 'Adds an Edit button on previewed Readmes in folders, even if you have to make a fork. Also fixes GitHub’s own "Edit readme" link on tag pages.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/62073307-a8378880-b26a-11e9-9e31-be6525d989d2.png'
}, {
	include: [
		features.isRepoTree
	],
	load: features.onAjaxedPages,
	init
});
