import {$} from 'select-dom';
import oneEvent from 'one-event';

export default async function loadDetailsMenu(detailsMenu: HTMLElement): Promise<void> {
	const fragment = $('.js-comment-header-actions-deferred-include-fragment', detailsMenu);
	if (!fragment) {
		return;
	}

	detailsMenu.parentElement!.dispatchEvent(new Event('mouseover'));
	await oneEvent(fragment, 'load');
}
