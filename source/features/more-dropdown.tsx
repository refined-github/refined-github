import './more-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import diffIcon from 'octicon/diff.svg';
import branchIcon from 'octicon/git-branch.svg';
import historyIcon from 'octicon/history.svg';
import packageIcon from 'octicon/package.svg';
import features from '../libs/features';
import {getRepoURL, getReference} from '../libs/utils';
import {isEnterprise} from '../libs/page-detect';
import {appendBefore} from '../libs/dom-utils';

const repoUrl = getRepoURL();

function createDropdown(): void {
	// Markup copied from native GHE dropdown
	appendBefore('.reponav', '[href$="settings"]',
		<details className="reponav-dropdown details-overlay details-reset">
			<summary className="btn-link reponav-item">
				{'More '}
				<span className="dropdown-caret"/>
			</summary>
			<details-menu className="dropdown-menu dropdown-menu-se"/>
		</details>
	);
}

async function init(): Promise<void> {
	await elementReady('.pagehead + *'); // Wait for the tab bar to be loaded
	if (!select.exists('.reponav-dropdown')) {
		createDropdown();
	}

	let compareUrl = `/${repoUrl}/compare`;
	let commitsUrl = `/${repoUrl}/commits`;
	const reference = getReference();
	if (reference) {
		compareUrl += `/${reference}`;
		commitsUrl += `/${reference}`;
	}

	const menu = select('.reponav-dropdown .dropdown-menu')!;

	menu.append(
		<a href={compareUrl} className="rgh-reponav-more dropdown-item">
			{diffIcon()} Compare
		</a>,

		isEnterprise() ? '' : (
			<a href={`/${repoUrl}/network/dependencies`} className="rgh-reponav-more dropdown-item">
				{packageIcon()} Dependencies
			</a>
		),

		<a href={commitsUrl} className="rgh-reponav-more dropdown-item">
			{historyIcon()} Commits
		</a>,

		<a href={`/${repoUrl}/branches`} className="rgh-reponav-more dropdown-item">
			{branchIcon()} Branches
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

features.add({
	id: __featureName__,
	description: 'Adds links to `Commits`, `Branches`, `Dependencies`, and `Compare` in a new `More` dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/55089736-d94f5300-50e8-11e9-9095-329ac74c1e9f.png',
	include: [
		features.isRepo
	],
	load: features.nowAndOnAjaxedPages,
	init
});
