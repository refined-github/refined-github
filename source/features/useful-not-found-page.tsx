import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import twas from 'twas';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getCleanPathname} from '../github-helpers';

function getType(): string {
	return location.pathname.split('/').pop()!.includes('.') ? 'file' : 'object';
}

async function is404(url: string): Promise<boolean> {
	const {status} = await fetch(url, {method: 'head'});
	return status === 404;
}

function getStrikeThrough(text: string): HTMLElement {
	return <del className="color-text-tertiary">{text}</del>; /* GHE #4121 */
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

async function displayObjectStatus(bar: Element): Promise<void> {
	// Object might have been deleted/moved
	if (!await addObjectStatusInfo(bar)) {
		// Or 410 Gone
		await addCommitHistoryLink(bar);
	}
}

async function addObjectStatusInfo(bar: Element): Promise<boolean> {
	// Get the file path from the parts
	const parts = parseCurrentURL();
	const filePath = parts.slice(4).join("/")

	// Get the last 2 commits that include the file
	const previousCommitsIncludingFile = await api.v3(`commits?path=${filePath}&per_page=2`)
	// The latest commit will be the first object in the array
	if (previousCommitsIncludingFile[0]) {
		// Get a list of changes that happened in the repo with this commit
		const lastCommitInfo = await api.v3(`commits/${previousCommitsIncludingFile[0]['sha']}`);
		
		// Check what happened to this file
		const [fileInfo] = lastCommitInfo.files.filter((file: Record<string, string>) => (file.filename === filePath));
		// If it was removed, tell the user
		if (fileInfo.status === 'removed') {
			const commitAuthor = lastCommitInfo.author.login;
			const urlToCommitAuthorProfile = lastCommitInfo.author.html_url;
			const urlToLastVersionOfFile = fileInfo.blob_url;
			const commitTime = new Date(lastCommitInfo.commit.committer.date);

			bar.after(
				<p className="container mt-4 text-center">
					The file you are looking for was deleted/moved by <a href={urlToCommitAuthorProfile}>{commitAuthor}</a> { twas(commitTime.getTime()) }.
					<br />
					You can view the last version of the file <a href={urlToLastVersionOfFile}>here</a>.
				</p>,
			);

			return true;
		}
	}

	return false;
}

// If the object was deleted, link to the commit history
async function addCommitHistoryLink(bar: Element): Promise<void> {
	const parts = parseCurrentURL();
	parts[2] = 'commits';
	const url = '/' + parts.join('/');
	if (await is404(location.origin + url)) {
		return;
	}

	bar.after(
		<p className="container mt-4 text-center">
			See also the {getType()}’s <a href={url}>commit history</a>.
		</p>,
	);
}

async function addBranchStatusInfo(bar: Element): Promise<void> {
	// Get the current branch
	const parts = parseCurrentURL()
	const currentBranch = parts[3]

	// List all valid branches
	const branches = await api.v3(`branches`)

	// Check if the branch exists
	const matchingBranches = branches.filter((branch: Record<string, string>) => (branch.name === currentBranch))
	if (matchingBranches.length === 0) {
		return bar.after(
			<p className="container mt-4 text-center">
				The branch you are trying to view does not exist.
			</p>,
		);
	}
}

// If the object exists in the default branch, link to it
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
			The {getType()} exists on the <a href={url}>default branch</a>.
		</p>,
	);
}

function init(): false | void {
	const parts = parseCurrentURL();
	if (parts.length <= 1 || !select.exists('[alt*="This is not the web page you are looking for"]')) {
		return false;
	}

	const bar = <h2 className="container mt-4 text-center"/>;

	for (const [i, part] of parts.entries()) {
		if (i === 2 && ['tree', 'blob', 'edit'].includes(part)) {
			// Exclude parts that don't exist as standalones
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
		void checkAnchor(bar.children[i] as HTMLAnchorElement);
	}

	if (['tree', 'blob'].includes(parts[2])) {
		void displayObjectStatus(bar)
	}

	if (['tree', 'blob', 'edit'].includes(parts[2])) {
		// File might not be available on the current branch
		// GitHub already redirects /tree/ and /blob/ natively
		void addDefaultBranchLink(bar);
		// Or the branch itself may not exist
		void addBranchStatusInfo(bar);
	}
}

async function initPRCommit(): Promise<void | false> {
	const commitUrl = location.href.replace(/pull\/\d+\/commits/, 'commit');
	if (await is404(commitUrl)) {
		return false;
	}

	const blankSlateParagraph = await elementReady('.blankslate p', {waitForChildren: false});
	blankSlateParagraph!.after(
		<p>You can also try to <a href={commitUrl}>view the detached standalone commit</a>.</p>,
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.is404,
	],
	init: onetime(init),
}, {
	include: [
		pageDetect.isPRCommit404,
	],
	awaitDomReady: false,
	init: onetime(initPRCommit),
});
