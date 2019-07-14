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

	forkDialog.addEventListener('load', () => {

	});
	forkDialog.click();


	const forkButton = select('summary[title^="Fork your own copy of"]')!;
	forkButton.parentElement!.classList.remove('details-overlay-dark');
	forkButton.classList.add('select-menu-button');
	forkButton.append(
		<span>
			<span className="Counter">{forks.length}</span>
			<> </>
		</span>
	);
	forkButton.after(
		<details-menu
			style={{ zIndex: 99 }}
			className="select-menu-modal position-absolute right-0 mt-5">
			<div className="select-menu-header">
				<span className="select-menu-title">Your forks</span>
			</div>
			{...forks.map(fork =>
				<a href={`/${fork}`}
					className="select-menu-item"
					title={`Open your fork to ${fork}`}>
					{icons.fork()}
					{fork}
				</a>
			)}
			<a href={`/${getRepoURL()}/fork`}
				className="select-menu-item">
				{icons.fork()}
				Create fork...
				</a>
			<div className="select-menu-header">
				<span className="select-menu-title">Create fork</span>
			</div>
			<form className="" method="post" action="/sindresorhus/refined-github/fork">
				<button type="submit" name="organization" value="motivaction" className="select-menu-item width-full"
					aria-label="Will be created as motivaction/refined-github." title="@motivaction">

					<span className="select-menu-item-gravatar select-menu-item-icon">
						<img src="https://avatars1.githubusercontent.com/u/50828444?s=40&amp;v=4" alt="@motivaction" width="20" height="20" />
					</span>
					<span className="select-menu-item-text">
						motivaction
					</span>



				</button>
				<input type="hidden" name="authenticity_token" value="PeZdPNir2GvFaE5LtnugXL28qrbk4oec8b8fGOiEaRGimUYn801iY8nGiNqeU7cKXGf1XyFc34Tmn4P9WYzRJA==" />
			</form>
		</details-menu>
	);
	forkDialog.addEventListener('load', () => {
		select('details-dialog[src*="/fork"]')!.remove();
	});

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
