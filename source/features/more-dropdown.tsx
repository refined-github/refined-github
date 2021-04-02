import './more-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {DiffIcon, GitBranchIcon, HistoryIcon, PackageIcon} from '@primer/octicons-react';

import features from '.';
import {appendBefore} from '../helpers/dom-utils';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers';

function createDropdown(): void {
	// Markup copied from native GHE dropdown
	appendBefore(
		// GHE doesn't have `reponav > ul`
		select('.reponav > ul') ?? select('.reponav')!,
		'[data-selected-links^="repo_settings"]',
		<details className="reponav-dropdown details-overlay details-reset">
			<summary className="btn-link reponav-item" aria-haspopup="menu">
				{'More '}
				<span className="dropdown-caret"/>
			</summary>
			<details-menu className="dropdown-menu dropdown-menu-se"/>
		</details>
	);
}

/* eslint-disable-next-line import/prefer-default-export */
export function createDropdownItem(label: string, url: string, attributes?: Record<string, string>): Element {
	return (
		<li {...attributes}>
			<a role="menuitem" className="dropdown-item" href={url}>
				{label}
			</a>
		</li>
	);
}

function onlyShowInDropdown(id: string): void {
	const tabItem = select(`[data-tab-item$="${id}"]`);
	if (!tabItem && pageDetect.isEnterprise()) { // GHE might not have the Security tab #3962
		return;
	}

	tabItem!.closest('.UnderlineNav-item, li')!.remove();
	const menuItem = select(`[data-menu-item$="${id}"]`)!;
	menuItem.removeAttribute('data-menu-item');
	menuItem.hidden = false;

	// The item has to be moved somewhere else because the overflow nav is order-dependent
	select('.js-responsive-underlinenav-overflow ul')!.append(menuItem);
}

async function init(): Promise<void> {
	// Wait for the tab bar to be loaded
	await elementReady([
		'.pagehead', // Pre "Repository refresh" layout
		'.UnderlineNav-body'
	].join());

	const reference = getCurrentCommittish() ?? await getDefaultBranch();
	const compareUrl = buildRepoURL('compare', reference);
	const commitsUrl = buildRepoURL('commits', reference);
	const branchesUrl = buildRepoURL('branches');
	const dependenciesUrl = buildRepoURL('network/dependencies');

	const nav = select('.js-responsive-underlinenav .UnderlineNav-body');
	if (nav) {
		// "Repository refresh" layout
		nav.parentElement!.classList.add('rgh-has-more-dropdown');
		select('.js-responsive-underlinenav-overflow ul')!.append(
			<li className="dropdown-divider" role="separator"/>,
			createDropdownItem('Compare', compareUrl),
			pageDetect.isEnterprise() ? '' : createDropdownItem('Dependencies', dependenciesUrl),
			createDropdownItem('Commits', commitsUrl),
			createDropdownItem('Branches', branchesUrl)
		);

		onlyShowInDropdown('security-tab');
		onlyShowInDropdown('insights-tab');
		return;
	}

	// Pre "Repository refresh" layout
	if (!select.exists('.reponav-dropdown')) {
		createDropdown();
	}

	const menu = select('.reponav-dropdown .dropdown-menu')!;
	menu.append(
		<a href={compareUrl} className="rgh-reponav-more dropdown-item">
			<DiffIcon/> Compare
		</a>,

		pageDetect.isEnterprise() ? '' : (
			<a href={dependenciesUrl} className="rgh-reponav-more dropdown-item">
				<PackageIcon/> Dependencies
			</a>
		),

		<a href={commitsUrl} className="rgh-reponav-more dropdown-item">
			<HistoryIcon/> Commits
		</a>,

		<a href={branchesUrl} className="rgh-reponav-more dropdown-item">
			<GitBranchIcon/> Branches
		</a>
	);

	// Selector only affects desktop navigation
	for (const tab of select.all(`
		.hx_reponav a[data-selected-links~="pulse"],
		.hx_reponav a[data-selected-links~="security"]
	`)) {
		tab.remove();
		menu.append(
			<a href={tab.href} className="rgh-reponav-more dropdown-item">
				{[...tab.childNodes]}
			</a>
		);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init
});
