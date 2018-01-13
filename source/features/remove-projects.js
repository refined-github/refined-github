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
	const filters = select.all('.issues-listing .table-list-filters .select-menu-button');
	const [projectsFilter] = filters.filter(filter => filter.textContent.includes('Projects'));

	projectsFilter.remove();
}

function removeProjectsSidebarItem() {
	const sidebarItems = select.all('.js-discussion-sidebar-item');
	const [projectsSidebarItem] = sidebarItems.filter(item => select('.discussion-sidebar-heading', item).textContent.includes('Projects'));

	projectsSidebarItem.remove();
}

export default function () {
	removeProjectsTab();

	if (select.exists(projectsTabSelector)) {
		return;
	}

	if (pageDetect.isIssueList() || pageDetect.isPRList()) {
		removeProjectsFilter();
	}

	if (pageDetect.isIssue() || pageDetect.isNewIssue() || pageDetect.isPRConversation() || pageDetect.isNewPR()) {
		removeProjectsSidebarItem();
	}
}
