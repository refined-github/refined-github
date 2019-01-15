import {h} from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import {safeElementReady} from '../libs/utils';

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

async function init() {
	await safeElementReady('.pagehead + *'); // Wait for the tab bar to be loaded
	if (removeProjectsTab()) {
		addNewProjectLink();
	}
}

features.add({
	id: 'remove-projects-tab',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
