/*
Hide sections under sidebar with no content or for which the user has no permissions
*/
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';

async function shouldRetainSidebarItem(sidebarItem: HTMLElement): Promise<boolean> {
	const form = select('form', sidebarItem);
	if (form) {
		// Dropdown exists if you have permission to do something,
		// if there is something that the user can do, then retain it
		const dropdown = select('.js-select-menu-deferred-content', form);
		if (dropdown) {
			const dom = await fetchDom(location.origin + dropdown.dataset.url!);

			if (select.exists('.select-menu-item .select-menu-item-text input', dom)) {
				return true;
			}

			return false;
		}
	}

	// If there is no dropdown or form, then see if there is any userful information
	const content = (form || sidebarItem).lastElementChild;
	if (content && content.firstElementChild) {
		return true;
	}

	return false;
}

function init(): void {
	const sidebarItems = select.all('.discussion-sidebar-item');

	for (const sidebarItem of sidebarItems) {
		(async () => {
			if (await shouldRetainSidebarItem(sidebarItem)) {
				return;
			}

			sidebarItem.remove();
		})();
	}
}

features.add({
	id: 'clean-discussion-sidebar',
	include: [
		features.isPRConversation,
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
