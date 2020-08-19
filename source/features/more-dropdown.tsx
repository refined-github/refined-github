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
import {getRepoURL, getCurrentBranch} from '../github-helpers';

const repoUrl = getRepoURL();

/* eslint-disable-next-line import/prefer-default-export */
export function createDropdownItem(label: string, url: string, attributes?: Record<string, string>, Icon?: () => JSX.Element): Element {
	return (
		<li {...attributes}>
			<a role="menuitem" className="dropdown-item" href={url}>
				{Icon && <Icon className="UnderlineNav-octicon d-none d-sm-inline"/>}
				<span>{label}</span>
			</a>
		</li>
	);
}

async function init(): Promise<void> {
	// Wait for the tab bar to be loaded
	await elementReady([
		'.UnderlineNav-body + *'
	].join());

	const reference = getCurrentBranch();
	const compareUrl = `/${repoUrl}/compare/${reference}`;
	const commitsUrl = `/${repoUrl}/commits/${reference}`;
	const dependenciesUrl = `/${repoUrl}/network/dependencies`;

	const nav = select('.js-responsive-underlinenav .UnderlineNav-body');

	if (!nav) {
		return;
	}

	const menu = select('.js-responsive-underlinenav-overflow ul')!;

	nav.parentElement!.classList.add('rgh-has-more-dropdown');
	menu.append(
		<li className="dropdown-divider" role="separator"/>,
		createDropdownItem('Compare', compareUrl, {}, DiffIcon),
		pageDetect.isEnterprise() ? '' : createDropdownItem('Dependencies', dependenciesUrl, {}, PackageIcon),
		createDropdownItem('Commits', commitsUrl, {}, HistoryIcon),
		createDropdownItem('Branches', `/${repoUrl}/branches`, {}, BranchIcon)
	);

	for (const tab of select.all<HTMLAnchorElement>(`
		.js-responsive-underlinenav-item[data-tab-item="insights-tab"],
		.js-responsive-underlinenav-item[data-tab-item="security-tab"]
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
