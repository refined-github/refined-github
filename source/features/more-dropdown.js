import select from 'select-dom';
import {h} from 'dom-chef';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';
import {appendBefore} from '../libs/utils';

const repoUrl = pageDetect.getRepoURL();

function getDropdown() {
	const nativeDropdown = select('.reponav-dropdown .dropdown-menu');
	if (nativeDropdown) {
		return nativeDropdown;
	}

	// Markup copied from native GHE dropdown
	const dropdown = (
		<div class="reponav-dropdown js-menu-container">
			<button type="button" class="btn-link reponav-item js-menu-target" aria-expanded="false" aria-haspopup="true">
				{'More '}
				<span class="dropdown-caret"></span>
			</button>
			<div class="dropdown-menu-content js-menu-content">
				<div class="dropdown-menu dropdown-menu-se">
				</div>
			</div>
		</div>
	);
	appendBefore('.reponav', '[href$="settings"]', dropdown);
	return select('.dropdown-menu', dropdown);
}

export default function () {
	getDropdown().append(
		<a href={`/${repoUrl}/compare`} class="dropdown-item" data-skip-pjax>
			{icons.darkCompare()}
			{' Compare'}
		</a>,

		pageDetect.isEnterprise() ? '' :
			<a href={`/${repoUrl}/network/dependencies`} class="dropdown-item rgh-dependency-graph" data-skip-pjax>
				{icons.dependency()}
				{' Dependencies'}
			</a>,

		<a href={`/${repoUrl}/pulse`} class="dropdown-item" data-skip-pjax>
			{icons.graph()}
			{' Insights'}
		</a>
	);

	// Remove native Insights tab
	const insightsTab = select('[data-selected-links~="pulse"]');
	if (insightsTab) {
		insightsTab.remove();
	}
}
