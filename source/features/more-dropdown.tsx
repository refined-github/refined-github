import './more-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import DiffIcon from 'octicon/diff.svg';
import BranchIcon from 'octicon/git-branch.svg';
import HistoryIcon from 'octicon/history.svg';
import PackageIcon from 'octicon/package.svg';
import KebabHorizontalIcon from 'octicon/kebab-horizontal.svg';

import features from '.';
import {appendBefore} from '../helpers/dom-utils';
import {getRepoURL, getCurrentBranch} from '../github-helpers';

const repoUrl = getRepoURL();

// Pre "Repository refresh" layout
function createLegacyDropdown(): void {
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
export function createDropdownItem(label: string, url: string, overflow: boolean): Element {
	const id = `rgh-${label.toLowerCase()}-item`;
	const item = overflow ?
		<li data-menu-item={id}/> :
		<li data-tab-item={id} className="js-responsive-underlinenav-item"/>;
	item.append(
		<a role="menuitem" className="dropdown-item" href={url}>
			{label}
		</a>
	);
	return item;
}

function createDropdown(): Element {
	const reference = getCurrentBranch();
	const compareUrl = `/${repoUrl}/compare/${reference}`;
	const commitsUrl = `/${repoUrl}/commits/${reference}`;
	const dependenciesUrl = `/${repoUrl}/network/dependencies`;
	return (
		<li className="d-flex js-responsive-underlinenav-item" data-tab-item="rgh-more-dropdown">
			<details className="details-overlay details-reset position-relative">
				<summary role="button" aria-haspopup="menu">
					<div className="UnderlineNav-item mr-0 border-0">
						<KebabHorizontalIcon/>
						<span className="sr-only">More</span>
					</div>
				</summary>
				<details-menu className="dropdown-menu dropdown-menu-sw" role="menu">
					<ul>
						{createDropdownItem('Compare', compareUrl, false)}
						{pageDetect.isEnterprise() && createDropdownItem('Dependencies', dependenciesUrl, false)}
						{createDropdownItem('Commits', commitsUrl, false)}
						{createDropdownItem('Branches', `/${repoUrl}/branches`, false)}
					</ul>
				</details-menu>
			</details>
		</li>
	);
}

async function init(): Promise<void> {
	await elementReady('.pagehead + *'); // Wait for the tab bar to be loaded

	const nav = select('.js-responsive-underlinenav .UnderlineNav-body');
	if (nav) {
		// "Repository refresh" layout
		nav.parentElement!.classList.add('rgh-has-more-dropdown');
		const settingsTab = select('[data-tab-item="settings-tab"]');
		if (settingsTab) {
			settingsTab.parentElement!.after(createDropdown());
		} else {
			nav.append(createDropdown());
		}

		const reference = getCurrentBranch();
		const compareUrl = `/${repoUrl}/compare/${reference}`;
		const commitsUrl = `/${repoUrl}/commits/${reference}`;
		const dependenciesUrl = `/${repoUrl}/network/dependencies`;
		const menu = select('.js-responsive-underlinenav-overflow ul')!;

		menu.append(
			<div data-menu-item="rgh-more-dropdown"/>,
			createDropdownItem('Compare', compareUrl, true),
			pageDetect.isEnterprise() ? '' : createDropdownItem('Dependencies', dependenciesUrl, true),
			createDropdownItem('Commits', commitsUrl, true),
			createDropdownItem('Branches', `/${repoUrl}/branches`, true)
		);

		return;
	}

	if (!select.exists('.reponav-dropdown')) {
		createLegacyDropdown();
	}

	const reference = getCurrentBranch();
	const compareUrl = `/${repoUrl}/compare/${reference}`;
	const commitsUrl = `/${repoUrl}/commits/${reference}`;

	const menu = select('.reponav-dropdown .dropdown-menu')!;

	menu.append(
		<a href={compareUrl} className="rgh-reponav-more dropdown-item">
			<DiffIcon/> Compare
		</a>,

		pageDetect.isEnterprise() ? '' : (
			<a href={`/${repoUrl}/network/dependencies`} className="rgh-reponav-more dropdown-item">
				<PackageIcon/> Dependencies
			</a>
		),

		<a href={commitsUrl} className="rgh-reponav-more dropdown-item">
			<HistoryIcon/> Commits
		</a>,

		<a href={`/${repoUrl}/branches`} className="rgh-reponav-more dropdown-item">
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
