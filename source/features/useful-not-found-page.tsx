import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getCleanPathname} from '../github-helpers';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';

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

async function getLatestChangeToFile(): Promise<Record<string, any> | void> {
	const url = new GitHubURL(location.href);
	const {branch, filePath} = url;
	if (!branch || !filePath) {
		return;
	}

	const commitsResponseObject = await api.v4(`
		repository() {
			ref(qualifiedName: "${branch}") {
				target {
					... on Commit {
						history(first: 1, path: "${filePath}") {
							nodes {
								oid
							}
						}
					}
				}
			}
		}
	`);
	const commits = commitsResponseObject.repository.ref.target.history.nodes;
	if (!commits[0]) {
		return;
	}

	// API v4 doesn't support retrieving a list of changed files for a commit:
	// https://github.community/t/graphql-api-get-list-of-files-related-to-commit/14047/2
	const commitInfo = await api.v3(`commits/${commits[0].oid as string}`);
	const fileInfo = commitInfo.files.find((file: AnyObject) => [file.filename, file.previous_filename].includes(filePath));
	if (!fileInfo) {
		return;
	}

	return {fileInfo, commitInfo};
}

async function getUrlToFileOnDefaultBranch(): Promise<string | void> {
	const url = new GitHubURL(location.href);
	const currentBranch = url.branch;
	if (!currentBranch) {
		return;
	}

	const defaultBranch = await getDefaultBranch();
	if (currentBranch === defaultBranch) {
		return;
	}

	url.assign({
		branch: defaultBranch,
	});
	if (await is404(url.toString())) {
		return;
	}

	return url.toString();
}

async function showMissingPart(): Promise<void> {
	const parts = parseCurrentURL();
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
}

async function showHelpfulLinks(): Promise<void> {
	// What we should try to do to be helpful:
	//  1. Check if the file is on the default branch
	//  2. Check the current branch's history for the file (was it deleted or renamed)

	const urlToFileOnDefaultBranch = await getUrlToFileOnDefaultBranch();
	if (urlToFileOnDefaultBranch) {
		select('h2')!.after(
			<p className="container mt-4 text-center">
				<a href={urlToFileOnDefaultBranch}>This {getType()}</a> exists on the default branch.
			</p>,
		);
		return;
	}

	const change = await getLatestChangeToFile();
	if (change) {
		const {fileInfo, commitInfo} = change;
		const url = new GitHubURL(location.href);

		url.assign({route: 'commits'});
		const commitHistory = <a href={url.toString()}>Commit history</a>;
		url.assign({route: 'blob', branch: commitInfo.parents[0].sha, filePath: url.filePath});
		const lastVersion = <a href={fileInfo.status === 'removed' ? fileInfo.blob_url : url.toString()}>This {getType()}</a>;
		const permalink = <a href={commitInfo.html_url}><relative-time datetime={commitInfo.commit.committer.date}/></a>;
		const verb = fileInfo.status === 'removed'
			? 'deleted'
			: <a href={fileInfo.status === 'renamed' ? fileInfo.blob_url : url.toString()}>moved</a>;

		select('h2')!.after(
			<p className="container mt-4 text-center">
				{lastVersion} was {verb} ({permalink}) - {commitHistory}.
			</p>,
		);
	}
}

function init(): false | void {
	const parts = parseCurrentURL();
	if (parts.length <= 1 || !select.exists('[alt*="This is not the web page you are looking for"]')) {
		return false;
	}

	void showMissingPart();
	void showHelpfulLinks();
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
