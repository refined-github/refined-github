import './more-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {getRepoURL} from '../libs/utils';
import {isEnterprise} from '../libs/page-detect';
import {appendBefore, safeElementReady} from '../libs/dom-utils';

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
	await safeElementReady('.pagehead + *'); // Wait for the tab bar to be loaded
	if (!select.exists('.reponav-dropdown')) {
		createDropdown();
	}

	select('.reponav-dropdown .dropdown-menu')!.append(
		<a href={`/${repoUrl}/compare`} className="rgh-reponav-more dropdown-item" data-skip-pjax>
			{icons.darkCompare()} Compare
		</a>,

		isEnterprise() ? '' :
			<a href={`/${repoUrl}/network/dependencies`} className="rgh-reponav-more dropdown-item rgh-dependency-graph" data-skip-pjax>
				{icons.dependency()} Dependencies
			</a>,

		<a href={`/${repoUrl}/pulse`} className="rgh-reponav-more dropdown-item" data-skip-pjax>
			{icons.graph()} Insights
		</a>,

		<a href={`/${repoUrl}/commits`} className="rgh-reponav-more dropdown-item" data-skip-pjax>
			{icons.history()} Commits
		</a>,

		<a href={`/${repoUrl}/branches`} className="rgh-reponav-more dropdown-item" data-skip-pjax>
			{icons.branch()} Branches
		</a>,
	);

	// Remove native Insights tab
	const insightsTab = select('[data-selected-links~="pulse"]');
	if (insightsTab) {
		insightsTab.remove();
	}
}

features.add({
	id: 'more-dropdown',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
