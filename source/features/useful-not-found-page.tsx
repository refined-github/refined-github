import React from 'dom-chef';
import {$} from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {getCleanPathname, isUrlReachable} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import GetLatestCommitToFile from './useful-not-found-page.gql';

type File = {
	previous_filename?: string;
	filename: string;
	status: string;
	blob_url: string;
};

type FileChanges = {
	file: File;
	commit: {
		parentSha: string;
		date: Date;
		url: string;
	};
};

function getType(): string {
	return location.pathname.split('/').pop()!.includes('.') ? 'file' : 'object';
}

function getStrikeThrough(text: string): HTMLElement {
	return <del className="color-fg-subtle">{text}</del>;
}

async function crossIfNonExistent(anchor: HTMLElement): Promise<void> {
	if (anchor instanceof HTMLAnchorElement && !await isUrlReachable(anchor.href)) {
		anchor.replaceWith(getStrikeThrough(anchor.textContent));
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
	const {repository} = await api.v4(GetLatestCommitToFile, {
		variables: {
			branch,
			filePath,
		},
	});
	const commit = repository.object?.history.nodes[0];
	return commit?.oid;
}

async function getChangesToFileInCommit(sha: string, filePath: string): Promise<FileChanges | void> {
	// API v4 doesn't support it: https://github.community/t/what-is-the-corresponding-object-in-graphql-api-v4-for-patch-which-is-available-in-rest-api-v3/13590
	const commit = await api.v3(`commits/${sha}`);
	for (const fileInfo of commit.files as File[]) {
		if ([fileInfo.filename, fileInfo.previous_filename].includes(filePath)) {
			return {
				commit: {
					parentSha: commit.parents[0].sha,
					date: commit.commit.committer.date,
					url: commit.html_url,
				},
				file: fileInfo,
			};
		}
	}
}

async function getUrlToFileOnDefaultBranch(): Promise<string | void> {
	const parsedUrl = new GitHubFileURL(location.href);
	if (!parsedUrl.branch) {
		return;
	}

	parsedUrl.assign({branch: await getDefaultBranch()});
	const urlOnDefault = parsedUrl.href;
	if (urlOnDefault !== location.href && await isUrlReachable(urlOnDefault)) {
		return urlOnDefault;
	}
}

async function showMissingPart(): Promise<void> {
	const pathParts = parseCurrentURL();
	const breadcrumbs = [...pathParts.entries()]
		.reverse() // Checks the anchors right to left
		.map(([i, part]) => {
			if (
				// Exclude parts that don't exist as standalones
				(i === 0 && part === 'orgs') // #5483
				|| (i === 2 && ['tree', 'blob', 'edit'].includes(part))
				|| i === pathParts.length - 1 // The last part is a known 404
			) {
				return getStrikeThrough(part);
			}

			const pathname = '/' + pathParts.slice(0, i + 1).join('/');
			const link = <a href={pathname}>{part}</a>;
			void crossIfNonExistent(link);
			return link;
		})
		.reverse() // Restore order
		.flatMap((link, i) => [i > 0 && ' / ', link]); // Add separators

	$('main > :first-child, #parallax_illustration')!.after(
		<h2 className="container mt-4 text-center">{breadcrumbs}</h2>,
	);
}

async function showDefaultBranchLink(): Promise<void> {
	const urlToFileOnDefaultBranch = await getUrlToFileOnDefaultBranch();
	if (!urlToFileOnDefaultBranch) {
		return;
	}

	$('main > .container-lg')!.before(
		<p className="container mt-4 text-center">
			<a href={urlToFileOnDefaultBranch}>This {getType()}</a> exists on the default branch.
		</p>,
	);
}

async function getGitObjectHistoryLink(): Promise<HTMLElement | undefined> {
	const url = new GitHubFileURL(location.href);
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
	const permalink = (
		<a href={fileChanges.commit.url}>
			<relative-time datetime={fileChanges.commit.date}/>
		</a>
	);
	const verb = fileChanges.file.status === 'removed'
		? 'deleted'
		: <a href={fileChanges.file.blob_url}>moved</a>;

	return (
		<p className="container mt-4 text-center">
			{lastVersion} was {verb} ({permalink}) - {commitHistory}.
		</p>
	);
}

async function showGitObjectHistory(): Promise<void> {
	const link = await getGitObjectHistoryLink();
	if (link) {
		$('main > .container-lg')!.before(link);
	}
}

async function showGitObjectHistoryOnRepo(description: HTMLDivElement): Promise<void> {
	const link = await getGitObjectHistoryLink();
	if (link) {
		link.className = 'color-fg-muted';
		description.after(link);
	}
}

function init(): void {
	void showDefaultBranchLink();
	void showGitObjectHistory();
}

async function initPRCommit(): Promise<void | false> {
	const commitUrl = location.href.replace(/pull\/\d+\/commits/, 'commit');
	if (!await isUrlReachable(commitUrl)) {
		return false;
	}

	const blankSlateParagraph = await elementReady('.blankslate p', {waitForChildren: false});
	blankSlateParagraph!.after(
		<p>You can also try to <a href={commitUrl}>view the detached standalone commit</a>.</p>,
	);
}

function initRepoFile(signal: AbortSignal): void {
	observe('#repos-header-breadcrumb-wide-heading + ol a', crossIfNonExistent, {signal});
	observe('main div[data-testid="eror-404-description"]', showGitObjectHistoryOnRepo, {signal});	// "eror" as misspelled by GitHub
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.is404,
		() => parseCurrentURL().length > 1,
	],
	awaitDomReady: true, // Small page
	init: onetime(showMissingPart),
}, {
	asLongAs: [
		pageDetect.is404,
	],
	include: [
		pageDetect.isSingleFile,
		pageDetect.isRepoTree,
		pageDetect.isEditingFile,
	],
	awaitDomReady: true, // Small page
	init: onetime(init),
}, {
	include: [
		pageDetect.isPRCommit404,
	],
	init: onetime(initPRCommit),
}, {
	include: [
		pageDetect.isRepoFile404,
	],
	init: initRepoFile,
});

/*

Test URLs:

- 404 issue: https://github.com/refined-github/refined-github/issues/888888
- 404 file: https://github.com/refined-github/refined-github/blob/main/source/features/a-horse-with-no-name.tsx
- 410 file: https://github.com/refined-github/refined-github/blob/main/extension/content.js
- 404 ref: https://github.com/refined-github/refined-github/blob/eggs-for-branch/package.json

*/
