import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';
import {getChangesToFileInCommit} from './follow-file-renames';
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
	return <del className="color-text-tertiary color-fg-subtle">{text}</del>;
}

async function checkAnchor(anchor: HTMLElement): Promise<void> {
	if (anchor instanceof HTMLAnchorElement && await is404(anchor.href)) {
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

async function getLatestCommitToFile(branch: string, filePath: string): Promise<string | void> {
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
	return commit?.oid;
}

async function getUrlToFileOnDefaultBranch(): Promise<string | void> {
	const parsedUrl = new GitHubURL(location.href);
	if (!parsedUrl.branch) {
		return;
	}

	parsedUrl.assign({branch: await getDefaultBranch()});
	const urlOnDefault = parsedUrl.href;
	if (urlOnDefault !== location.href && !await is404(urlOnDefault)) {
		return urlOnDefault;
	}
}

async function showMissingPart(): Promise<void> {
	const pathParts = parseCurrentURL();
	const breadcrumbs: HTMLElement[] = [];

	for (const [i, part] of pathParts.entries()) {
		// Exclude parts that don't exist as standalones
		if (i === 0 && part === 'orgs') {
			continue;
		}

		if (i === 2 && ['tree', 'blob', 'edit'].includes(part)) {
			continue;
		}

		if (i === pathParts.length - 1) {
			// The last part of the URL is a known 404
			breadcrumbs.push(getStrikeThrough(part));
		} else {
			const pathname = '/' + pathParts.slice(0, i + 1).join('/');
			breadcrumbs.push(<a href={pathname}>{part}</a>);
		}
	}

	select('main > :first-child, #parallax_illustration')!.after(
		<h2 className="container mt-4 text-center">
			{breadcrumbs.flatMap((link, i) => [i > 0 && ' / ', link])}
		</h2>,
	);

	// Check parts from right to left; skip the last part
	for (let i = breadcrumbs.length - 2; i >= 0; i--) {
		void checkAnchor(breadcrumbs[i]);
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
	const url = new GitHubURL(location.href);
	if (!url.branch || !url.filePath) {
		return;
	}

	const commitSha = await getLatestCommitToFile(url.branch, url.filePath);
	if (!commitSha) {
		return;
	}

	const fileChanges = await getChangesToFileInCommit(commitSha, url.filePath);
	if (!fileChanges) {
		return;
	}

	url.assign({route: 'commits'});
	const commitHistory = <a href={url.href}>Commit history</a>;
	url.assign({route: 'blob', branch: fileChanges.commit.parentSha, filePath: url.filePath});
	const lastVersionUrl = fileChanges.file.status === 'removed' ? fileChanges.file.blob_url : url.href;
	const lastVersion = <a href={lastVersionUrl}>This {getType()}</a>;
	const permalink = <a href={fileChanges.commit.url}><relative-time datetime={fileChanges.commit.date}/></a>;
	const verb = fileChanges.file.status === 'removed'
		? 'deleted'
		: <a href={fileChanges.file.blob_url}>moved</a>;

	select('main > .container-lg')!.before(
		<p className="container mt-4 text-center">
			{lastVersion} was {verb} ({permalink}) - {commitHistory}.
		</p>,
	);
}

function init(): void {
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

void features.add(import.meta.url, 	{
	asLongAs: [
		pageDetect.is404,
		() => parseCurrentURL().length > 1,
	],
	init: showMissingPart,
},
{
	asLongAs: [
		pageDetect.is404,
	],
	include: [
		pageDetect.isSingleFile,
		pageDetect.isRepoTree,
		pageDetect.isEditingFile,
	],
	init: onetime(init),
}, {
	include: [
		pageDetect.isPRCommit404,
	],
	awaitDomReady: false,
	init: onetime(initPRCommit),
});
