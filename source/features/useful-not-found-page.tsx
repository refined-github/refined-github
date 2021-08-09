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

async function is404(url: string): Promise<boolean> {
	const {status} = await fetch(url, {method: 'head'});
	return status === 404;
}

function getStrikeThrough(text: string): HTMLElement {
	return <del className="color-text-tertiary">{text}</del>; /* GHE #4121 */
}

async function checkIfPartExists(element: HTMLAnchorElement): Promise<void> {
	if (await is404(element.href)) {
		element.replaceWith(getStrikeThrough(element.textContent!));
	}
}

function parseCurrentURL(): string[] {
	const parts = getCleanPathname().split('/');
	if (parts[2] === 'blob') { // Blob URLs are never useful
		parts[2] = 'tree';
	}

	return parts;
}

async function showMissingPart(bar: Element): Promise<void> {
	const parts = parseCurrentURL();

	for (const [i, part] of parts.entries()) {
		if (i === 2 && ['tree', 'blob', 'edit'].includes(part)) {
			// Exclude parts that don't exist as standalones
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
		void checkIfPartExists(bar.children[i] as HTMLAnchorElement);
	}
}

async function showHelpfulLinks(bar: Element): Promise<void> {
	// What we should try to do to be helpful:
	//  1. Check if the file is on the default branch
	//  2. Check the current branch's history for the file (was it deleted or renamed)

	const urlToFileOnDefaultBranch = await (async () => {
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
	})();

	if (urlToFileOnDefaultBranch) {
		bar.after(
			<p className="container mt-4 text-center">
				View <a href={urlToFileOnDefaultBranch}>this file</a> on the default branch.
			</p>,
		);
		return;
	}

	const change = await (async (): Promise<Record<string, any> | void> => {
		const url = new GitHubURL(location.href);
		const currentBranch = url.branch;
		const {filePath} = url;
		if (!currentBranch || !filePath) {
			return;
		}

		const commits = await api.v3(`commits?path=${filePath}&sha=${currentBranch}&per_page=2`);
		if (!commits[0]) {
			return;
		}

		const commitInfo = await api.v3(`commits/${commits[0].sha as string}`);
		const fileInfo = commitInfo.files.find((file: AnyObject) => [file.filename, file.previous_filename].includes(filePath));
		if (!fileInfo) {
			return;
		}

		const commitSha = commitInfo.sha.slice(0, 8);
		const commitDate = commitInfo.commit.committer.date;
		const linkToCommit = commitInfo.html_url;

		url.assign({
			route: 'commits',
		});
		const linkToCommitHistory = url.toString();

		if (fileInfo.status === 'removed') {
			return {
				type: 'removed',
				commitDetails: {
					filePath,
					commitSha, commitDate,
					linkToCommit, linkToCommitHistory,
					linkToLastVersion: fileInfo.blob_url,
				},
			};
		}

		if (fileInfo.status === 'renamed') {
			url.assign({
				route: 'blob',
				branch: commitInfo.parents[0].sha,
				filePath,
			});

			return {
				type: 'renamed',
				commitDetails: {
					filePath: fileInfo.previous_filename, newFilePath: fileInfo.filename,
					commitSha, commitDate,
					linkToCommit, linkToCommitHistory,
					linkToLastVersion: url.toString(), linkToNewVersion: fileInfo.blob_url,
				},
			};
		}
	})();

	if (change) {
		if (change.type === 'renamed') {
			bar.after(
				<p className="container mt-4 text-center">
					<a href={change.commitDetails.linkToLastVersion}>This file</a> was renamed to <a href={change.commitDetails.linkToNewVersion}>{change.commitDetails.newFilePath}</a> (<a href={change.commitDetails.linkToCommit}><relative-time datetime={change.commitDetails.commitDate}/></a>) - view the file&apos;s <a href={change.commitDetails.linkToCommitHistory}>commit history</a>.
				</p>,
			);
			return;
		}

		if (change.type === 'removed') {
			bar.after(
				<p className="container mt-4 text-center">
					<a href={change.commitDetails.linkToLastVersion}>This file</a> was removed (<a href={change.commitDetails.linkToCommit}><relative-time datetime={change.commitDetails.commitDate}/></a>) - view the file&apos;s <a href={change.commitDetails.linkToCommitHistory}>commit history</a>.
				</p>,
			);
		}
	}
}

function initUsefulNotFoundPage(): void {
	if (
		parseCurrentURL().length <= 1 || !select.exists('[alt*="This is not the web page you are looking for"]')
	) {
		return;
	}

	const bar = <h2 className="container mt-4 text-center"/>;
	void showMissingPart(bar);
	void showHelpfulLinks(bar);
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
	init: onetime(initUsefulNotFoundPage),
}, {
	include: [
		pageDetect.isPRCommit404,
	],
	awaitDomReady: false,
	init: onetime(initPRCommit),
});
