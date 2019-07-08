import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import features from '../libs/features';
import {getRepoURL, getUsername} from '../libs/utils';
import {isRepoWithAccess} from '../libs/page-detect';

const getCacheKey = (repo: string): string => `forked-to:${getUsername()}@${repo}`;

async function showForks(): Promise<void> {
	const cached = await getValidatedCache(getSourceRepo());
	const pageHeader = select('.pagehead h1.public')!;
	for (const fork of cached.filter(fork => fork !== getRepoURL())) {
		pageHeader.append(
			<span className="fork-flag rgh-forked">forked to&nbsp;
				<a href={`/${fork}`}>{fork}</a>
			</span>
		);
	}
}

function rememberCurrentFork(): void {
	if (!isRepoWithAccess()) {
		return;
	}

	const forkedRepo = findForkedRepo();
	if (forkedRepo) {
		addAndStoreCache(forkedRepo, getRepoURL());
	}
}

function watchForkDialog(): void {
	const forkDialog = select('details-dialog[src*="/fork"]')!;
	select('include-fragment', forkDialog)!.addEventListener('load', () => {
		const forks = select.all('.octicon-repo-forked', forkDialog).map(forkElement => {
			return forkElement.parentNode!.textContent!.trim();
		});
		addAndStoreCache(getSourceRepo(), ...forks);
	});
}

function findForkedRepo(): string | undefined {
	const forkSourceElement = select<HTMLAnchorElement>('.fork-flag:not(.rgh-forked) a');
	if (forkSourceElement) {
		return forkSourceElement.pathname.slice(1);
	}

	return undefined;
}

function getSourceRepo(): string {
	return findForkedRepo() || getRepoURL();
}

async function validateFork(repo: string): Promise<boolean> {
	const response = await fetch(location.origin + '/' + repo, {method: 'HEAD'});
	return response.ok;
}

async function getValidatedCache(repo: string): Promise<string[]> {
	const cached = await cache.get<string[]>(getCacheKey(repo)) || [];
	const validForks = cached.filter(validateFork).sort(undefined);

	if (cached.length !== validForks.length) {
		await cache.set<string[]>(getCacheKey(repo), validForks, 10);
	}

	return validForks;
}

async function addAndStoreCache(repo: string, ...forks: string[]): Promise<void> {
	const cached = await cache.get<string[]>(getCacheKey(repo)) || [];
	for (const fork of forks) {
		if (!cached.includes(fork)) {
			cached.push(fork);
		}
	}

	await cache.set<string[]>(getCacheKey(repo), cached, 10);
}

async function init(): Promise<void> {
	watchForkDialog();

	rememberCurrentFork();

	showForks();
}

features.add({
	id: __featureName__,
	description: 'Your repo forks are shown under the repo title',
	screenshot: 'https://user-images.githubusercontent.com/55841/60543588-f5c9df80-9d16-11e9-8667-52ff16b2cb16.png',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
