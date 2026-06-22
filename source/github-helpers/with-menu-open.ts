import {$} from 'select-dom';

import {frame} from '../helpers/dom-utils.js';

export default async function withMenuOpen<T>(
	menuButton: HTMLButtonElement,
	callback: (menu: HTMLElement) => T,
): Promise<T> {
	menuButton.click();
	// Wait for the menu DOM to be created, but not rendered
	await frame();

	try {
		// When executing concurrently, there might be multiple menus open.
		const menu = $(`[aria-labelledby="${menuButton.id}"]`);
		const result = callback(menu);
		return result;
	} finally {
		menuButton.click();
	}
}
