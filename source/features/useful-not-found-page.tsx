import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';
import {getChangesToFileInCommit, CommitInfo} from './follow-file-renames';
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

async function getLatestChangeToFile(): Promise<CommitInfo | void> {
	const {branch, filePath} = new GitHubURL(location.href);
	if (!branch || !filePath) {
		return;
	}

	const {repository} = await api.v4(`
		repository() {
			object(expression: "${branch}") {
				... on Commit {
					history(first: 1, path: "${filePath}") {
						nodes {
							oid
						}
					}
				}
			}
		}
	`);
	const commit = repository.object?.history.nodes[0];
	if (!commit) {
		return;
	}

	return getChangesToFileInCommit(commit.oid as string, filePath);
}

async function getUrlToFileOnDefaultBranch(): Promise<string | void> {
	const parsedUrl = new GitHubURL(location.href);
	if (!parsedUrl.branch) {
		return;
	}

	parsedUrl.assign({branch: await getDefaultBranch()});
	const urlOnDefault = parsedUrl.toString();
	if (urlOnDefault !== location.href && !await is404(urlOnDefault)) {
		return urlOnDefault;
	}
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

async function showDefaultBranchLink(): Promise<void> {
	const urlToFileOnDefaultBranch = await getUrlToFileOnDefaultBranch();
	if (!urlToFileOnDefaultBranch) {
		return;
	}

	select('main > .container-lg')!.before(
		<p className="container mt-4 text-center">
			<a href={urlToFileOnDefaultBranch}>This {getType()}</a> exists on the default branch.
		</p>,
	);
}

async function showAlternateLink(): Promise<void> {
	const change = await getLatestChangeToFile();
	if (!change || !change.file) {
		return;
	}

	const url = new GitHubURL(location.href);

	url.assign({route: 'commits'});
	const commitHistory = <a href={url.toString()}>Commit history</a>;
	url.assign({route: 'blob', branch: change.parentSha, filePath: url.filePath});
	const lastVersionUrl = change.file.status === 'removed' ? change.file.url : url.toString();
	const lastVersion = <a href={lastVersionUrl}>This {getType()}</a>;
	const permalink = <a href={change.url}><relative-time datetime={change.date}/></a>;
	const verb = change.file.status === 'removed'
		? 'deleted'
		: <a href={change.file.url}>moved</a>;

	select('main > .container-lg')!.before(
		<p className="container mt-4 text-center">
			{lastVersion} was {verb} ({permalink}) - {commitHistory}.
		</p>,
	);
}

function init(): false | void {
	const parts = parseCurrentURL();
	if (parts.length <= 1 || !select.exists('[alt*="This is not the web page you are looking for"]')) {
		return false;
	}

	void showMissingPart();
	void showDefaultBranchLink();
	void showAlternateLink();
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
