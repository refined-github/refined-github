import './more-dropdown-links.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers';

export function createDropdownItem(label: string, url: string, attributes?: Record<string, string>): Element {
	return (
		<li {...attributes}>
			<a role="menuitem" className="dropdown-item" href={url}>
				{label}
			</a>
		</li>
	);
}

export function onlyShowInDropdown(id: string): void {
	const tabItem = select(`[data-tab-item$="${id}"]`);
	if (!tabItem && pageDetect.isEnterprise()) { // GHE #3962
		return;
	}

	(tabItem!.closest('li') ?? tabItem!.closest('.UnderlineNav-item'))!.classList.add('d-none');

	const menuItem = select(`[data-menu-item$="${id}"]`)!;
	menuItem.removeAttribute('data-menu-item');
	menuItem.hidden = false;
	// The item has to be moved somewhere else because the overflow nav is order-dependent
	select('.js-responsive-underlinenav-overflow ul')!.append(menuItem);
}

export async function unhideOverflowDropdown(): Promise<void> {
	// Wait for the tab bar to be loaded
	const repoNavigationBar = (await elementReady('.UnderlineNav-body'))!;
	repoNavigationBar.parentElement!.classList.add('rgh-has-more-dropdown');
}

async function init(): Promise<void> {
	const reference = getCurrentCommittish() ?? await getDefaultBranch();
	const compareUrl = buildRepoURL('compare', reference);
	const commitsUrl = buildRepoURL('commits', reference);
	const branchesUrl = buildRepoURL('branches');
	const dependenciesUrl = buildRepoURL('network/dependencies');
	await unhideOverflowDropdown();

	select('.js-responsive-underlinenav-overflow ul')!.append(
		<li className="dropdown-divider" role="separator"/>,
		createDropdownItem('Compare', compareUrl),
		pageDetect.isEnterprise() ? '' : createDropdownItem('Dependencies', dependenciesUrl),
		createDropdownItem('Commits', commitsUrl),
		createDropdownItem('Branches', branchesUrl),
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		pageDetect.isEmptyRepo,
	],
	awaitDomReady: false,
	init,
});
