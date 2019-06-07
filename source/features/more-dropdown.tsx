import './more-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {getRepoURL, getRef} from '../libs/utils';
import {isEnterprise} from '../libs/page-detect';
import {appendBefore} from '../libs/dom-utils';

const repoUrl = getRepoURL();

function createDropdown(): void {
	// Markup copied from native GHE dropdown
	appendBefore('.reponav', '[href$="settings"]',
		<div className="reponav-dropdown js-menu-container">
			<button type="button" className="btn-link reponav-item js-menu-target" aria-expanded="false" aria-haspopup="true">
				{'More '}
				<span className="dropdown-caret"/>
			</button>
			<div className="dropdown-menu-content js-menu-content">
				<div className="dropdown-menu dropdown-menu-se"/>
			</div>
		</div>
	);
}

async function init(): Promise<void> {
	await elementReady('.pagehead + *'); // Wait for the tab bar to be loaded
	if (!select.exists('.reponav-dropdown')) {
		createDropdown();
	}

	let compareUrl = `/${repoUrl}/compare`;
	let commitsUrl = `/${repoUrl}/commits`;
	const ref = getRef();
	if (ref) {
		compareUrl += `/${ref}`;
		commitsUrl += `/${ref}`;
	}

	const menu = select('.reponav-dropdown .dropdown-menu')!;

	menu.append(
		<a href={compareUrl} className="rgh-reponav-more dropdown-item">
			{icons.darkCompare()} Compare
		</a>,

		isEnterprise() ? '' :
			<a href={`/${repoUrl}/network/dependencies`} className="rgh-reponav-more dropdown-item">
				{icons.dependency()} Dependencies
			</a>,

		<a href={commitsUrl} className="rgh-reponav-more dropdown-item">
			{icons.history()} Commits
		</a>,

		<a href={`/${repoUrl}/branches`} className="rgh-reponav-more dropdown-item">
			{icons.branch()} Branches
		</a>,
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
	id: 'more-dropdown',
	description: 'Access the `Commits`, `Branches`, `Dependencies`, and `Compare` pages from anywhere in a repository',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
