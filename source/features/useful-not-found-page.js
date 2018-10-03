/*
This feature adds more useful 404 (not found) page.
- Display the full URL clickable piece by piece
- Strikethrough all anchor that return a 404 status code
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname} from '../libs/page-detect';
import getDefaultBranch from '../libs/get-default-branch';

async function is404(url) {
	const {status} = await fetch(url, {method: 'head'});
	return status === 404;
}

async function checkAnchor(anchor) {
	if (await is404(anchor.href)) {
		anchor.replaceWith(
			<del style={{color: '#6a737d'}}>{anchor.textContent}</del>
		);
	}
}

function parseCurrentURL() {
	const parts = getCleanPathname().split('/');
	if (parts[2] === 'blob') { // Blob URLs are never useful
		parts[2] = 'tree';
	}
	return parts;
}

async function addCommitHistoryLink(bar) {
	const parts = parseCurrentURL();
	if (parts[2] !== 'tree') {
		return;
	}
	parts[2] = 'commits';
	const url = '/' + parts.join('/');
	if (await is404(url)) {
		return;
	}
	bar.after(
		<p class="container">
			See also the file’s {<a href={url}>commit history</a>}
		</p>
	);
}

async function addDefaultBranchLink(bar) {
	const parts = getCleanPathname().split('/');
	const [,,, branch] = parts;
	if (!branch) {
		return;
	}
	const defaultBranch = await getDefaultBranch();
	if (!defaultBranch || branch === defaultBranch) {
		return;
	}
	parts[3] = defaultBranch;
	const url = '/' + parts.join('/');
	if (await is404(url)) {
		return;
	}
	bar.after(
		<p class="container">
			See also the file on the {<a href={url}>default branch</a>}
		</p>
	);
}

export default function () {
	const parts = parseCurrentURL();
	const bar = <h2 class="container" />;

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (i === 2 && part === 'tree') {
			continue;
		}
		const pathname = '/' + parts.slice(0, i + 1).join('/');
		bar.append(' / ', <a href={pathname}>{part}</a>);
	}

	// NOTE: We need to append it after the parallax_wrapper because other elements might not be available yet.
	select('#parallax_wrapper').after(bar);

	// Check parts from right to left
	for (let i = bar.children.length - 1; i >= 0; i--) {
		checkAnchor(bar.children[i]);
	}

	addCommitHistoryLink(bar);
	addDefaultBranchLink(bar);
}
