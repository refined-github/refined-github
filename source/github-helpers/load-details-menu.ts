import {$optional} from 'select-dom/strict.js';
import {pEvent} from 'p-event';

export default async function loadDetailsMenu(detailsMenu: HTMLElement): Promise<void> {
	const fragment = $optional('.js-comment-header-actions-deferred-include-fragment', detailsMenu);
	if (!fragment) {
		return;
	}

	detailsMenu.parentElement!.dispatchEvent(new Event('mouseover'));
	await pEvent(fragment, 'load');
}
