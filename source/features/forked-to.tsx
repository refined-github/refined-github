import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import cache from '../libs/cache';
import {getRepoURL} from '../libs/utils';
import {isOwnRepo} from '../libs/page-detect';

const currentRepo = getRepoURL();

async function init(): Promise<void> {
	onForkDialogOpened();

	onForkedPage();

	await checkForks();
}

// Check for cached forks.
async function checkForks(): Promise<void> {
	const repo = getOriginalRepo();
	const cached = await getCache(repo);
	const validForks = cached.filter(validateFork);
	for (const fork of await Promise.all(validForks)) {
		if (fork !== currentRepo) {
			appendLink(fork);
			storeCache(repo, fork);
		}
	}
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

// Check if we are on a forked page.
function onForkedPage(): void {
	if (!isOwnRepo()) {
		return;
	}

	const forkedFromElm = select<HTMLElement>('.fork-flag:not(.rgh-forked) a');
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
function onFragmentLoaded(forkDialog: HTMLElement): void {
	removeLinks();

	const repo = getOriginalRepo();
	const forks = select.all<HTMLElement>('.octicon-repo-forked', forkDialog).map(forkElm => {
		const fork = forkElm.parentNode!.textContent!.trim();
		appendLink(fork);
		return fork;
	});

	storeCache(repo, ...forks);
}

// Get the original repo, by checking if we are already on a fork.
function getOriginalRepo(): string {
	let repo;

	const forkSourceElement = select<HTMLElement>('.fork-flag:not(.rgh-forked) a');
	if (forkSourceElement) {
		repo = forkSourceElement.getAttribute('href')!.substring(1);
	} else {
		repo = currentRepo;
	}

	return repo;
}

// Get cache and sort it.
async function getCache(repo: string): Promise<string[]> {
	const cached = await cache.get<string[]>(key(repo)) || [];
	cached.sort(undefined);
	return Promise.resolve(cached);
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
function appendLink(fork: string): void {
	select<HTMLElement>('.pagehead h1.public')!.append(
		<span className="fork-flag rgh-forked" data-repository-hovercards-enabled>
			<span className="text">forked to&nbsp;
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
