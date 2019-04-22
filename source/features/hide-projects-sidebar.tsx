/*
Hide projects under issue/PR sidebar if no projects exist
*/
import select from 'select-dom';
import domify from 'doma';
import features from '../libs/features';
import {safeElementReady} from '../libs/dom-utils';

const projectsSidebarSelector = '.js-issue-sidebar-form[action*="/projects/issues/"]';

async function init(): Promise<void> {
	await safeElementReady(projectsSidebarSelector);

	const projectsSidebar = select(projectsSidebarSelector)!;
	const projectsDropdown = select('.js-select-menu-deferred-content', projectsSidebar);

	// Dropdown exists only if you have permission to add/remove projects
	if (projectsDropdown) {
		const partialsUrl = projectsDropdown.dataset.url!;

		const response = await fetch(partialsUrl);
		const dom = domify(await response.text());

		const projects = select.all('.select-menu-item', dom);
		if (projects && projects.length > 0) {
			return;
		}
	}

	projectsSidebar.parentElement!.remove();
}

features.add({
	id: 'hide-projects-sidebar',
	load: features.onAjaxedPages,
	init
});
