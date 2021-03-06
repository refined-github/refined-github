/** @jsx h */
import {h} from 'preact';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import render from '../helpers/render';

import features from '.';
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
			See also the {getType()}’s <a href={url}>commit history</a>.
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
			The {getType()} exists on the <a href={url}>default branch</a>.
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
		// Object might be 410 Gone
		void addCommitHistoryLink(bar);
	}

	if (['tree', 'blob', 'edit'].includes(parts[2])) {
		// File might not be available on the current branch
		// GitHub already redirects /tree/ and /blob/ natively
		void addDefaultBranchLink(bar);
	}
}

async function initPRCommit(): Promise<void | false> {
	const commitUrl = location.href.replace(/pull\/\d+\/commits/, 'commit');
	if (await is404(commitUrl)) {
		return false;
	}

	const blankSlateParagraph = await elementReady('.blankslate p', {waitForChildren: false});
	blankSlateParagraph!.after(
		<p>You can also try to <a href={commitUrl}>view the detached standalone commit</a>.</p>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.is404
	],
	init: onetime(init)
}, {
	include: [
		pageDetect.isPRCommit404
	],
	awaitDomReady: false,
	init: onetime(initPRCommit)
});
