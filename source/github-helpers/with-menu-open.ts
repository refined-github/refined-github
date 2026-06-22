import {$} from 'select-dom';
import {assertError} from 'ts-extras';

import {frame} from '../helpers/dom-utils.js';
import {logError} from '../helpers/errors.js';

export default async function withMenuOpen<T>(
	menuButton: HTMLButtonElement,
	callback: (menu: HTMLElement) => T,
): Promise<T | undefined> {
	menuButton.click();
	// Wait for the menu DOM to be created, but not rendered
	await frame();

	let result: T | undefined;
	try {
		// When executing concurrently, there might be multiple menus open.
		const menu = $(`[aria-labelledby="${menuButton.id}"]`);
		result = callback(menu);
	} catch (error) {
		assertError(error);
		logError(error);
	} finally {
		menuButton.click();
	}

	return result;
}
