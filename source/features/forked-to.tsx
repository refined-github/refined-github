import './forked-to.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import pFilter from 'p-filter';
import onetime from 'onetime';
import features from '../libs/features';
import {isRepoWithAccess} from '../libs/page-detect';
import {getRepoURL, getUsername} from '../libs/utils';

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

async function updateForks(forks: string[]): Promise<void> {
	// Don't validate current page: it exists; it won't be shown in the list; it will be added later anyway
	const validForks = await pFilter(forks.filter(fork => fork !== getRepoURL()), validateFork);

	// Add current repo to cache if it's a fork
	if (isRepoWithAccess() && findForkedRepo()) {
		save([...validForks, getRepoURL()].sort(undefined));
	} else {
		save(validForks);
	}
}

async function redesignForkDialog(this: HTMLElement): Promise<void> {
	const forkDialog = select('details-dialog[src*="/fork"]')!;
	console.log(forkDialog);

	const detailsDialog = <details-menu
		                      style={{ zIndex: 99 }}
		                      className="select-menu-modal position-absolute right-0 mt-5">
	                      </details-menu>;

	const forks = (select.all('form button[aria-label^="View fork"]', forkDialog) || []).map(element => {
		var fork = element.parentNode!.cloneNode(true) as HTMLElement;
		fork.firstElementChild!.className = 'select-menu-item width-full'; // form>button
		fork.firstElementChild!.firstElementChild!.className = 'select-menu-item-gravatar select-menu-item-icon'; // form>button>div
		fork.firstElementChild!.firstElementChild!.after(
			<span className="select-menu-item-text">
				{fork.firstElementChild!.firstElementChild!.firstElementChild!.nextSibling! /* form>button>div>img+textnode*/}
			</span>
		);
		return fork;
	});
	if (forks.length > 0) {
		detailsDialog.append(
			<div className="select-menu-header">
				<span className="select-menu-title">Your forks</span>
			</div>
		);
		detailsDialog.append(...forks);
	}


	const toBeForked = (select.all('form button[aria-label^="Will be created"]', forkDialog) || []).map(element => {
		var fork = element.parentNode!.cloneNode(true) as HTMLElement;
		fork.firstElementChild!.className = 'select-menu-item width-full'; // form>button
		fork.firstElementChild!.firstElementChild!.className = 'select-menu-item-gravatar select-menu-item-icon'; // form>button>div
		fork.firstElementChild!.firstElementChild!.after(
			<span className="select-menu-item-text">
				{fork.firstElementChild!.firstElementChild!.firstElementChild!.nextSibling! /* form>button>div>img+textnode*/}
			</span>
		);
		return fork;

		/*
		ORIGINAL HTML:
			<form class="button_to" method="post" action="/sindresorhus/refined-github/fork">
				<button type="submit" name="organization" value="organization" tabindex="0"
					class="btn-link f5 text-bold my-2 tooltipped tooltipped-se tooltipped-align-left-1" aria-label="Will be created as organization/refined-github." title="@organization">
					<div class="d-flex flex-items-center">
						<img class="avatar avatar-small mr-2" src="https://avatars2.githubusercontent.com/u/50828444?s=60&amp;v=4" alt="@organization" width="30" height="30">
						organization
					</div>
				</button>
				<input type="hidden" name="authenticity_token" value="sidifhfhsnklfdhvskdlfhkgdhgk">
			</form>

		NEEDED HTML:
			<form method="post" action={fork.parentNode.href}>
				<button type="submit" name="organization" value="organization" className="select-menu-item width-full"
					aria-label="Will be created as organization/refined-github." title="@organization">

					<span className="select-menu-item-gravatar select-menu-item-icon">
						<img src="https://avatars1.githubusercontent.com/u/50828444?s=40&amp;v=4" alt="@organization" width="20" height="20" />
					</span>
					<span className="select-menu-item-text">
						organization
					</span>
				</button>
				<input type="hidden" name="authenticity_token" value="sidifhfhsnklfdhvskdlfhkgdhgk" />
			</form>
		*/
	});
	console.log(toBeForked);

	for (const element of select.all('a.d-block', forkDialog)) {
		const fork = element.cloneNode(true) as HTMLElement;
		fork.className = 'select-menu-item';
		fork.firstElementChild!.className = 'select-menu-item-gravatar select-menu-item-icon';
		fork.firstElementChild!.after(
			<span className="select-menu-item-text">
				{fork.firstElementChild!!.nextSibling!}
			</span>
		);
		toBeForked.push(fork as HTMLElement);
		/*
		ORIGINAL HTML:
			<a class="d-block" href="/organization">
				<img class="avatar" src="https://avatars3.githubusercontent.com/u/5607437?s=40&amp;v=4" alt="@organization" width="20" height="20">
				organization
			</a>

		NEEDED HTML:
			<a href="/organization"
			   className="select-menu-item">
				<span className="select-menu-item-gravatar select-menu-item-icon">
					<img src="https://avatars1.githubusercontent.com/u/50828444?s=40&amp;v=4" alt="@organization" width="20" height="20" />
				</span>
				<span className="select-menu-item-text">
					organization
				</span>
			</a>
		*/
	}
	if (toBeForked.length > 0) {
		detailsDialog.append(
			<div className="select-menu-header">
				<a className="select-menu-title" href={`/${getRepoURL()}/fork`}>Create fork</a>
			</div>
		);
		detailsDialog.append(...toBeForked);
	}


	const forkButton = select('summary[title^="Fork your own copy of"]')!;
	forkButton.after(detailsDialog);

	forkDialog!.remove();
}

async function init(): Promise<void> {
	const forkDialog = select('details-dialog[src*="/fork"] include-fragment')!;
	forkDialog.addEventListener('load', saveAllForks);

	const forks = await cache.get<string[]>(getCacheKey()) || [];

	const forkButton = select('summary[title^="Fork your own copy of"]')!;
	forkButton.parentElement!.classList.remove('details-overlay-dark');
	forkButton.classList.add('select-menu-button');
	forkButton.append(
		<span>
			<span className="Counter">{forks.length}</span>
			<> </>
		</span>
	);

	forkDialog.addEventListener('load', redesignForkDialog);
	forkDialog.click();

	// Validate cache after showing links once, to make it faster
	await updateForks(forks);
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
