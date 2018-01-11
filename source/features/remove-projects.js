import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const projectsTabSelector = '.js-repo-nav .reponav-item[data-selected-links^="repo_projects"]';

function removeProjectsTab() {
	const projectsTab = select(projectsTabSelector);

	if (projectsTab && projectsTab.querySelector('.Counter, .counter').textContent === '0') {
		projectsTab.remove();
	}
}

function removeProjectsFilter() {
	if (select.exists(projectsTabSelector)) {
		return;
	}

	const filters = select.all('.issues-listing .table-list-filters .select-menu-button');
	const [projectsFilter] = filters.filter(f => f.textContent.includes('Projects'));

	projectsFilter.remove();
}

export default function () {
	removeProjectsTab();

	if (pageDetect.isIssueList() || pageDetect.isPRList()) {
		removeProjectsFilter();
	}
}
