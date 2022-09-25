import select from 'select-dom';
import oneEvent from 'one-event';

export default async function loadDetailsMenu(detailsMenu: HTMLElement): Promise<void> {
	const fragment = select('include-fragment.SelectMenu-loading', detailsMenu);
	if (!fragment) {
		return;
	}

	detailsMenu.parentElement!.dispatchEvent(new Event('mouseover'));
	await oneEvent(fragment, 'load');
}
