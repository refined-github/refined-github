import './forked-to.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import pFilter from 'p-filter';
import onetime from 'onetime';
import features from '../libs/features';
import {isRepoWithAccess} from '../libs/page-detect';
import {getRepoURL, getUsername} from '../libs/utils';
import * as icons from '../libs/icons';

const getCacheKey = onetime((): string => `forked-to:${getUsername()}@${findForkedRepo() || getRepoURL()}`);

async function save(forks: string[]): Promise<void> {
	if (forks.length === 0) {
		return cache.delete(getCacheKey());
	}

	return cache.set(getCacheKey(), forks, 10);
}

async function saveAllForks(): Promise<void> {
	const forks = select
		.all('details-dialog[src*="/fork"] .octicon-repo-forked')
		.map(({nextSibling}) => nextSibling!.textContent!.trim());

	save(forks);
}

function findForkedRepo(): string | undefined {
	const forkSourceElement = select<HTMLAnchorElement>('.fork-flag a');
	if (forkSourceElement) {
		return forkSourceElement.pathname.slice(1);
	}

	return undefined;
}

async function validateFork(repo: string): Promise<boolean> {
	const response = await fetch(location.origin + '/' + repo, {method: 'HEAD'});
	return response.ok;
}

async function validateForks(forks: string[]): Promise<void> {
	// Don't validate current page: it exists; it won't be shown in the list; it will be added later anyway
	const validForks = await pFilter(forks.filter(fork => fork !== getRepoURL()), validateFork);

	// Add current repo to cache if it's a fork
	if (isRepoWithAccess() && findForkedRepo()) {
		save([...validForks, getRepoURL()].sort(undefined));
	} else {
		save(validForks);
	}
}

async function init(): Promise<void> {
	const forkDialog = select('details-dialog[src*="/fork"] include-fragment')!;
	forkDialog.addEventListener('load', saveAllForks);

	const forks = await cache.get<string[]>(getCacheKey());

	if (!forks) {
		return;
	}

	const forkButton = select('summary[title^="Fork your own copy of"]')!;
	if (forks.length === 1) {
		forkButton.before(
			<a href={`/${forks[0]}`}
				className="btn btn-sm float-left rgh-forked"
				title={`Open your fork to ${forks[0]}`}>
				{icons.externalLink()}
			</a>
		);
	} else {
		forkButton.classList.add('select-menu-button');
		forkButton.append(
			<span>
				<span className="Counter">{forks.length}</span>
				<> </>
			</span>
		);
		forkDialog.addEventListener('load', () => {
			const detailsDialog = select('details-dialog[src*="/fork"]')!;
			const detailsDialogContent = [...detailsDialog.cloneNode(true).childNodes];
			const detailsMenu = (
				<details-menu
					style={{zIndex: 99}}
					className="select-menu-modal position-absolute right-0 mt-5">
					{detailsDialogContent}
				</details-menu>
			);
			select('[data-close-dialog]', detailsMenu)!.remove();
			forkButton.after(detailsMenu);
			detailsDialog.remove();
		});
	}

	// Validate cache after showing links once, to make it faster
	await validateForks(forks);
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
