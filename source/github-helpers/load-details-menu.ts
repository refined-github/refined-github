import oneEvent from 'one-event';
import { $optional } from 'select-dom/strict.js';

export default async function loadDetailsMenu(detailsMenu: HTMLElement): Promise<void> {
	const fragment = $optional('.js-comment-header-actions-deferred-include-fragment', detailsMenu);
	if (!fragment) {
		return;
	}

	detailsMenu.parentElement!.dispatchEvent(new Event('mouseover'));
	await oneEvent(fragment, 'load');
}
