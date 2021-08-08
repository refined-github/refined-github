import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getCleanPathname} from '../github-helpers';

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
	// Blob URLs are never useful
	if (parts[2] === 'blob') {
		parts[2] = 'tree';
	}

	return parts;
}

async function getUrlToFileOnDefaultBranch(): Promise<string | undefined> {
	// Get the current branch
	const url = new GitHubURL(location.href);
	const currentBranch = url.branch;

	if (!currentBranch) {
		return;
	}

	const defaultBranch = await getDefaultBranch();
	if (currentBranch === defaultBranch) {
		return;
	}

	// Change branch
	url.assign({
		branch: defaultBranch
	})
	// Check if that path exists
	if (await is404(url.toString())) {
		return;
	}

	// If it does, return it
	return url.toString();
}

async function getLastCommitForFile(
	branch?: string,
): Promise<Record<string, string | undefined> | void> {
	// Get the current branch and file path
	const url = new GitHubURL(location.href);
	const currentBranch = url.branch;
	let filePath = url.filePath;

	// Get the last 2 commits that include the file
	const commitsForFileResponse = await api.v4(`
		repository() {
			ref(qualifiedName: "${branch ?? currentBranch}") {
				target {
					... on Commit {
						history(first: 2, path: "${filePath}") {
							nodes {
								oid
							}
						}
					}
				}
			}
		}
	`);
	// The latest commit will be the first object in the array
	const previousCommitsIncludingFile
		= commitsForFileResponse.repository.ref.target.history.nodes[0];
	if (!previousCommitsIncludingFile) {
		return;
	}

	// Get a list of changes that happened in the repo with this commit

	// API v4 doesn't support retrieving a list of changed files for a commit:
	// https://github.community/t/graphql-api-get-list-of-files-related-to-commit/14047/2
	const lastCommitInfo = await api.v3(
		`commits/${previousCommitsIncludingFile.oid as string}`,
	);

	// Check what happened to this particular file
	const fileInfo = lastCommitInfo.files.find((file: AnyObject) => [file.filename, file.previous_filename].includes(filePath));
	if (!fileInfo) {
		return;
	}

	// Get info
	const commitSha = lastCommitInfo.sha.slice(0, 8);
	const commitDate = lastCommitInfo.commit.committer.date;
	const linkToCommit = lastCommitInfo.html_url;

	url.assign({
		route: 'commits'
	})
	const linkToCommitHistory = url.toString();

	if (fileInfo.status === 'removed') {
		const linkToLastVersion = fileInfo.blob_url;

		return {
			type: 'removed',
			filePath,
			commitSha,
			commitDate,
			linkToCommit,
			linkToLastVersion,
			linkToCommitHistory,
		};
	}

	if (fileInfo.status === 'renamed') {
		const newFilePath = fileInfo.filename;
		filePath = fileInfo.previous_filename;

		const linkToNewVersion = fileInfo.blob_url;
		url.assign({
			route: 'blob',
			branch: lastCommitInfo.parents[0].sha,
			filePath
		})
		let linkToLastVersion = url.toString();

		return {
			type: 'renamed',
			filePath,
			newFilePath,
			commitSha,
			commitDate,
			linkToCommit,
			linkToLastVersion,
			linkToNewVersion,
			linkToCommitHistory,
		};
	}
}

async function getLinkToCommitHistoryOnDefaultBranch(): Promise<string | undefined> {
	// Get the current branch
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
		route: 'commits',
		branch: defaultBranch,
	})
	// Check if that path exists
	if (await is404(url.toString())) {
		return;
	}

	// If it does, return it
	return url.toString();
}

async function whatHappenedToTheFile(): Promise<Record<string, string | undefined> | void> {
	// First, check if the file exists on the default branch
	const urlOnDefaultBranch = await getUrlToFileOnDefaultBranch();
	if (urlOnDefaultBranch) {
		return {
			type: 'isOnDefaultBranch',
			linkToLastVersion: urlOnDefaultBranch,
		};
	}

	// Else, check if the file exists in commit history
	const lastCommitIncludingFile = await getLastCommitForFile();
	if (lastCommitIncludingFile) {
		return lastCommitIncludingFile;
	}

	// Else, check if the file exists in the default branch's history
	const linkToCommitHistoryOnDefaultBranch
		= await getLinkToCommitHistoryOnDefaultBranch();
	if (linkToCommitHistoryOnDefaultBranch) {
		return {
			type: 'wasOnDefaultBranch',
			linkToCommitHistory: linkToCommitHistoryOnDefaultBranch,
		};
	}
}

async function showAdditionalInformation(bar: Element): Promise<void> {
	// Check what happened
	const eventThatHappened = await whatHappenedToTheFile();
	if (!eventThatHappened) {
		return;
	}

	// Parse that and do/show something
	if (eventThatHappened.type === 'isOnDefaultBranch') {
		bar.after(
			<p className="container mt-4 text-center">
				<a href={eventThatHappened.linkToLastVersion}>This file</a> only exists on the default branch.
			</p>,
		);
		return;
	}

	if (eventThatHappened.type === 'wasOnDefaultBranch') {
		bar.after(
			<p className="container mt-4 text-center">
				This file used to exist on the default branch - see <a href={eventThatHappened.linkToCommitHistory}>commit history</a>.
			</p>,
		);
		return;
	}

	if (eventThatHappened.type === 'removed') {
		bar.after(
			<p className="container mt-4 text-center">
				<a href={eventThatHappened.linkToLastVersion}>This file</a> was deleted <a href={eventThatHappened.linkToCommit}><relative-time datetime={new Date(eventThatHappened.commitDate!)}/></a> - see <a href={eventThatHappened.linkToCommitHistory}>commit history</a>.
			</p>,
		);
		return;
	}

	if (eventThatHappened.type === 'renamed') {
		bar.after(
			<p className="container mt-4 text-center">
				<a href={eventThatHappened.linkToLastVersion}>This file</a> was renamed to <a href={eventThatHappened.linkToNewVersion}>{eventThatHappened.newFilePath}</a> (<a href={eventThatHappened.linkToCommit}><relative-time datetime={new Date(eventThatHappened.commitDate!)}/></a>) - see <a href={eventThatHappened.linkToCommitHistory}>commit history</a>.
			</p>,
		);
	}
}

async function showWhatIsMissingInPath(bar: Element): Promise<void> {
	// Get the current URL
	const parts = parseCurrentURL();

	// Display the path of the file (including repo owner, repo name and branch name)
	for (const [i, part] of parts.entries()) {
		// Exclude parts that don't exist as standalones
		if (i === 2 && ['tree', 'blob', 'edit'].includes(part)) {
			continue;
		}

		// The last part of the URL is a known 404
		if (i === parts.length - 1) {
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

function init(): false | void {
	// Get the current URL
	const parts = parseCurrentURL();

	// Check that this is actually a 404 page for a file/folder in a repo
	if (
		parts.length <= 1 || !select.exists('[alt*="This is not the web page you are looking for"]')
	) {
		return false;
	}

	// Create a bar to show the path of the file and which parts of it caused the 404
	const bar = <h2 className="container mt-4 text-center"/>;
	void showWhatIsMissingInPath(bar);

	// Show more info about what happened to the file
	void showAdditionalInformation(bar);
}

async function initPRCommit(): Promise<void | false> {
	const commitUrl = location.href.replace(/pull\/\d+\/commits/, 'commit');
	if (await is404(commitUrl)) {
		return false;
	}

	const blankSlateParagraph = await elementReady('.blankslate p', {
		waitForChildren: false,
	});
	blankSlateParagraph!.after(
		<p>
			You can also try to <a href={commitUrl}>view the detached standalone commit</a>.
		</p>,
	);
}

void features.add(
	__filebasename,
	{
		include: [pageDetect.is404],
		init: onetime(init),
	},
	{
		include: [pageDetect.isPRCommit404],
		awaitDomReady: false,
		init: onetime(initPRCommit),
	},
);
