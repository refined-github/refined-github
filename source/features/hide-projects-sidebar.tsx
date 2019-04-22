/*
Hide projects under issue/PR sidebar if no projects exist
*/
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';

async function init(): Promise<void> {
	const projectsSidebar = select('.js-issue-sidebar-form[action*="/projects/issues/"]')!;
	const projectsDropdown = select('.js-select-menu-deferred-content', projectsSidebar);

	// Dropdown exists only if you have permission to add/remove projects
	if (projectsDropdown) {
		const dom = await fetchDom(location.origin + projectsDropdown.dataset.url!);

		if (select.exists('.select-menu-item', dom)) {
			return;
		}
	}

	projectsSidebar.parentElement!.remove();
}

features.add({
	id: 'hide-projects-sidebar',
	include: [
		features.isPRConversation,
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
