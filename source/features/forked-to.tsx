import './more-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';
import {isOwnRepo} from '../libs/page-detect';
import cache from '../libs/cache';

const currentRepo = getRepoURL();

async function init(): Promise<void> {
	checkForks();
	onForkDialogOpened();
	if (isOwnRepo()) {
		onForkedPage();
	}
}

// Check for cached forks.
async function checkForks(): Promise<void> {
	const repoKey = key(currentRepo);
	const cached = await cache.get<string[]>(repoKey) || [];
	/* eslint-disable no-await-in-loop */
	for (const fork of cached) {
		const valid = await validateFork(fork);
		if (valid) {
			appendHtml(fork);
			storeCache(currentRepo, fork);
		}
	}
}

// Check if the fork still exists.
async function validateFork(repo: string): Promise<boolean> {
	const url = new URL('/' + repo, location.href);
	try {
		const response = await fetch(String(url),
			{
				method: 'HEAD'
			});
		return response.ok;
	} catch (error) {
		return false;
	}
}

// Check if we are on a forked page.
function onForkedPage(): void {
	const forkedFromElm = select<HTMLElement>('.fork-flag:not(.ghr-forked) a');
	if (forkedFromElm) {
		const forkedRepo = forkedFromElm.getAttribute('href')!.substring(1);
		storeCache(forkedRepo, currentRepo);
	}
}

// Check for opening the fork dialog.
function onForkDialogOpened(): void {
	const forkDialog = select<HTMLElement>('details-dialog[src*="/fork"]')!;
	const forkFragment = select<HTMLElement>('include-fragment', forkDialog)!;
	forkFragment.addEventListener('load', () => onFragmentLoaded(forkDialog));
}

// Event called when fork dialog is opened.
function onFragmentLoaded(parent: HTMLElement): void {
	for (const forkElm of select.all<HTMLElement>('.octicon-repo-forked', parent)) {
		const fork = forkElm.parentNode!.textContent!.trim();
		appendHtml(fork);
		storeCache(currentRepo, fork);
	}
}

// Save forks to cache.
async function storeCache(repo: string, fork: string): Promise<void> {
	const repoKey = key(repo);
	const cached = await cache.get<string[]>(repoKey) || [];
	if (!cached.includes(fork)) {
		cached.push(fork);
	}

	cache.set<string[]>(repoKey, cached, 10);
}

// Create the HTML.
function appendHtml(fork: string): void {
	const pageHeader = select<HTMLElement>('.pagehead h1.public')!;
	pageHeader.append(
		<span className={'fork-flag ghr-forked'} data-repository-hovercards-enabled>
			<span className={'text'}>forked to&nbsp;
				<a data-hovercard-type="repository" data-hovercard-url={`/${fork}/hovercard`} href={`/${fork}`}>
					{fork}
				</a>
			</span>
		</span>
	);
}

// Create the cache key.
function key(repo: string): string {
	return `forked-to:${repo}`;
}

features.add({
	id: 'forked-to',
	description: 'Add link to forked repo below the original',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
