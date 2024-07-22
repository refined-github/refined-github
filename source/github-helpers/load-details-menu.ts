import oneEvent from 'one-event';
import {$} from 'select-dom';

export default async function loadDetailsMenu(detailsMenu: HTMLElement): Promise<void> {
	const fragment = $('.js-comment-header-actions-deferred-include-fragment', detailsMenu);
	if (!fragment) {
		return;
	}

	detailsMenu.parentElement!.dispatchEvent(new Event('mouseover'));
	await oneEvent(fragment, 'load');
}
