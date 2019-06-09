import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import cache from '../libs/cache';
import {getRepoURL} from '../libs/utils';
import {isOwnRepo} from '../libs/page-detect';

const currentRepo = getRepoURL();

// Check for cached forks.
async function checkForks(): Promise<void> {
	const repo = getSourceRepo();
	const cached = await getCache(repo);
	const forks = cached.filter(fork => fork !== currentRepo);
	appendLink(...forks);
}

// Check if we are on a forked page.
function onForkedPage(): void {
	if (!isOwnRepo()) {
		return;
	}

	const forkSourceElement = select<HTMLElement>('.fork-flag:not(.rgh-forked) a');
	if (forkSourceElement) {
		const forkedRepo = forkSourceElement.getAttribute('href')!.substring(1);
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
function onFragmentLoaded(forkDialog: HTMLElement): void {
	removeLinks();

	const repo = getSourceRepo();
	const forks = select.all<HTMLElement>('.octicon-repo-forked', forkDialog).map(forkElement => {
		return forkElement.parentNode!.textContent!.trim();
	});

	appendLink(...forks);
	storeCache(repo, ...forks);
}

// Get the source repo, by checking if we are already on a fork.
function getSourceRepo(): string {
	let repo: string;

	const forkSourceElement = select<HTMLElement>('.fork-flag:not(.rgh-forked) a');
	if (forkSourceElement) {
		repo = forkSourceElement.getAttribute('href')!.substring(1);
	} else {
		repo = currentRepo;
	}

	return repo;
}

// Check if the fork still exists.
async function validateFork(repo: string): Promise<boolean> {
	const url = new URL(`/${repo}`, location.href);
	const response = await fetch(String(url),
		{
			method: 'HEAD'
		});
	return response.ok;
}

// Get cache and sort it.
async function getCache(repo: string): Promise<string[]> {
	const repoKey = key(repo);
	const cached = await cache.get<string[]>(repoKey) || [];
	const validForks = cached.filter(validateFork);
	validForks.sort(undefined);

	if (cached.length !== validForks.length) {
		await cache.set<string[]>(repoKey, validForks, 10);
	}

	return validForks;
}

// Save forks to cache.
async function storeCache(repo: string, ...forks: string[]): Promise<void> {
	const repoKey = key(repo);
	const cached = await cache.get<string[]>(repoKey) || [];
	for (const fork of forks) {
		if (!cached.includes(fork)) {
			cached.push(fork);
		}
	}

	await cache.set<string[]>(repoKey, cached, 10);
}

// Remove the fork links created.
function removeLinks(): void {
	const forks = select.all<HTMLElement>('.rgh-forked');
	for (const fork of forks) {
		fork.remove();
	}
}

// Create a fork link.
function appendLink(...forks: string[]): void {
	const pageHeader = select<HTMLElement>('.pagehead h1.public')!;
	for (const fork of forks) {
		pageHeader.append(
			<span className="fork-flag rgh-forked">
				<span className="text">forked to&nbsp;
					<a href={`/${fork}`}>{fork}</a>
				</span>
			</span>
		);
	}
}

// Create the cache key.
function key(repo: string): string {
	return `forked-to:${repo}`;
}

async function init(): Promise<void> {
	onForkDialogOpened();

	onForkedPage();

	await checkForks();
}

features.add({
	id: 'forked-to',
	description: 'Add link to forked repo below the source',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
