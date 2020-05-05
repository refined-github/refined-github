import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getCleanPathname} from '../libs/utils';
import getDefaultBranch from '../libs/get-default-branch';

async function is404(url: string): Promise<boolean> {
	const {status} = await fetch(url, {method: 'head'});
	return status === 404;
}

function getStrikeThrough(text: string): HTMLElement {
	return <del style={{color: '#6a737d'}}>{text}</del>;
}

async function checkAnchor(anchor: HTMLAnchorElement): Promise<void> {
	if (await is404(anchor.href)) {
		anchor.replaceWith(getStrikeThrough(anchor.textContent!));
	}
}

function parseCurrentURL(): string[] {
	const parts = getCleanPathname().split('/');
	if (parts[2] === 'blob') { // Blob URLs are never useful
		parts[2] = 'tree';
	}

	return parts;
}

// If the resource was deleted, link to the commit history
async function addCommitHistoryLink(bar: Element): Promise<void> {
	const parts = parseCurrentURL();
	parts[2] = 'commits';
	const url = '/' + parts.join('/');
	if (await is404(location.origin + url)) {
		return;
	}

	bar.after(
		<p className="container mt-4 text-center">
			See also the file’s <a href={url}>commit history</a>
		</p>
	);
}

// If the resource exists in the default branch, link to it
async function addDefaultBranchLink(bar: Element): Promise<void> {
	const parts = getCleanPathname().split('/');
	const branch = parts[3];
	if (!branch) {
		return;
	}

	const defaultBranch = await getDefaultBranch();
	if (branch === defaultBranch) {
		return;
	}

	parts[3] = defaultBranch; // Change branch
	const url = '/' + parts.join('/');
	if (await is404(location.origin + url)) {
		return;
	}

	bar.after(
		<p className="container mt-4 text-center">
			See also the file on the <a href={url}>default branch</a>
		</p>
	);
}

function init(): false | void {
	const parts = parseCurrentURL();
	if (parts.length <= 1 || !select.exists('[alt*="This is not the web page you are looking for"]')) {
		return false;
	}

	const bar = <h2 className="container mt-4 text-center"/>;

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

	select('main > :first-child, #parallax_illustration')!.after(bar);

	// Check parts from right to left; skip the last part
	for (let i = bar.children.length - 2; i >= 0; i--) {
		checkAnchor(bar.children[i] as HTMLAnchorElement);
	}

	if (parts[2] === 'tree') {
		addCommitHistoryLink(bar);
		addDefaultBranchLink(bar);
	}
}

features.add({
	id: __filebasename,
	description: 'Adds possible related pages and alternatives on 404 pages.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/46402857-7bdada80-c733-11e8-91a1-856573078ff5.png'
}, {
	include: [
		pageDetect.is404
	],
	repeatOnAjax: false,
	init
});
