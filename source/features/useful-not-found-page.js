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

function getStrikeThrough(text) {
	return <del style={{color: '#6a737d'}}>{text}</del>;
}

async function checkAnchor(anchor) {
	if (await is404(anchor.href)) {
		anchor.replaceWith(getStrikeThrough(anchor.textContent));
	}
}

function parseCurrentURL() {
	const parts = getCleanPathname().split('/');
	if (parts[2] === 'blob') { // Blob URLs are never useful
		parts[2] = 'tree';
	}
	return parts;
}

// If the resource was deleted, link to the commit history
async function addCommitHistoryLink(bar) {
	const parts = parseCurrentURL();
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

// If the resource exists in the default branch, link to it
async function addDefaultBranchLink(bar) {
	const parts = getCleanPathname().split('/');
	const branch = parts[3];
	if (!branch) {
		return;
	}
	const defaultBranch = await getDefaultBranch();
	if (!defaultBranch || branch === defaultBranch) {
		return;
	}
	parts[3] = defaultBranch; // Change branch
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
	if (parts.length <= 1) {
		return;
	}

	const bar = <h2 class="container"/>;

	for (const [i, part] of parts.entries()) {
		if (i === 2 && part === 'tree') {
			// `/tree/` is not a real part of the URL
			continue;
		}
		if (i === parts.length - 1) {
			// The last part of the URL is a known 404
			bar.append(' / ', getStrikeThrough(part));
		} else {
			const pathname = '/' + parts.slice(0, i + 1).join('/');
			bar.append(i ? ' / ' : '', <a href={pathname}>{part}</a>);
		}
	}

	// NOTE: We need to append it after the parallax_wrapper because other elements might not be available yet.
	select('#parallax_wrapper').after(bar);

	// Check parts from right to left; skip the last part
	for (let i = bar.children.length - 2; i >= 0; i--) {
		checkAnchor(bar.children[i]);
	}
	if (parts[2] === 'tree') {
		addCommitHistoryLink(bar);
		addDefaultBranchLink(bar);
	}
}
