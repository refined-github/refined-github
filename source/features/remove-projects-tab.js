import {h} from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from '../libs/page-detect';

const removeProjectsTab = () => {
	// Only those who can create a project will see the 'Settings' tab
	// so, do not remove the 'Projects' tab if the 'Settings' tab exists
	if (select.exists('.js-repo-nav [data-selected-links^="repo_settings"]')) {
		return false;
	}

	const projectsTab = select('.js-repo-nav [data-selected-links^="repo_projects"]');
	if (projectsTab && projectsTab.querySelector('.Counter, .counter').textContent === '0') {
		projectsTab.remove();
		return true;
	}
};

const addNewProjectLink = onetime(() => {
	const newIssueLink = select('.HeaderMenu .dropdown-item[href$="/issues/new"]');
	if (newIssueLink) {
		newIssueLink.after(
			<a class="dropdown-item" href={`/${pageDetect.getRepoURL()}/projects/new`}>
				New project
			</a>
		);
	}
});

export default function () {
	if (removeProjectsTab()) {
		addNewProjectLink();
	}
}
