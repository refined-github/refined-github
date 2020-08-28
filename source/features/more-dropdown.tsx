import './more-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import DiffIcon from 'octicon/diff.svg';
import BranchIcon from 'octicon/git-branch.svg';
import HistoryIcon from 'octicon/history.svg';
import PackageIcon from 'octicon/package.svg';

import features from '.';
import {appendBefore} from '../helpers/dom-utils';
import {getRepoURL, getCurrentBranch} from '../github-helpers';

const repoUrl = getRepoURL();

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
export function createDropdownItem(
	label: string,
	url: string,
	attributes?: Record<string, string>,
	Icon?: () => JSX.Element,
	count?: number
): Element {
	return (
		<li {...attributes}>
			<a role="menuitem" className="rgh-reponav-more dropdown-item" href={url}>
				{Icon && <Icon className="UnderlineNav-octicon d-none d-sm-inline"/>}
				<span>{label}</span>
				{count && <span className="Counter">{count}</span>}
			</a>
		</li>
	);
}

async function init(): Promise<void> {
	// Wait for the tab bar to be loaded
	await elementReady(
		[
			'.pagehead + *', // Pre "Repository refresh" layout
			'.UnderlineNav-body + *'
		].join()
	);

	const reference = getCurrentBranch();
	const compareUrl = `/${repoUrl}/compare/${reference}`;
	const commitsUrl = `/${repoUrl}/commits/${reference}`;
	const dependenciesUrl = `/${repoUrl}/network/dependencies`;
	const branchesUrl = `/${repoUrl}/branches`;

	const nav = select('.js-responsive-underlinenav .UnderlineNav-body');

	if (nav) {
		// "Repository refresh" layout
		const menu = select('.js-responsive-underlinenav-overflow ul')!;

		nav.parentElement!.classList.add('rgh-has-more-dropdown');
		menu.append(
			<li className="dropdown-divider" role="separator"/>,
			createDropdownItem('Compare', compareUrl, {}, DiffIcon),
			pageDetect.isEnterprise() ? '' : createDropdownItem('Dependencies', dependenciesUrl, {}, PackageIcon),
			createDropdownItem('Commits', commitsUrl, {}, HistoryIcon),
			createDropdownItem('Branches', branchesUrl, {}, BranchIcon)
		);

		for (const tab of select.all<HTMLAnchorElement>(`
			.js-responsive-underlinenav-item[data-tab-item="security-tab"],
			.js-responsive-underlinenav-item[data-tab-item="insights-tab"]
		`)) {
			tab.parentElement!.remove();

			menu.querySelector(`[data-menu-item="${tab.dataset.tabItem!}"]`)!.replaceWith(
				<li data-menu-item={tab.dataset.tabItem}>
					<a href={tab.href} className="rgh-reponav-more dropdown-item">
						{[...tab.childNodes]}
					</a>
				</li>
			);
		}

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

		pageDetect.isEnterprise() ? (
			''
		) : (
			<a href={dependenciesUrl} className="rgh-reponav-more dropdown-item">
				<PackageIcon/> Dependencies
			</a>
		),

		<a href={commitsUrl} className="rgh-reponav-more dropdown-item">
			<HistoryIcon/> Commits
		</a>,

		<a href={branchesUrl} className="rgh-reponav-more dropdown-item">
			<BranchIcon/> Branches
		</a>
	);

	// Selector only affects desktop navigation
	for (const tab of select.all<HTMLAnchorElement>(`
		.hx_reponav [data-selected-links~="pulse"],
		.hx_reponav [data-selected-links~="security"]
	`)) {
		tab.remove();
		menu.append(
			<a href={tab.href} className="rgh-reponav-more dropdown-item">
				{[...tab.childNodes]}
			</a>
		);
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds links to `Commits`, `Branches`, `Dependencies`, and `Compare` in a new `More` dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/55089736-d94f5300-50e8-11e9-9095-329ac74c1e9f.png'
}, {
	include: [
		pageDetect.isRepo
	],
	waitForDomReady: false,
	init
});
