import {assertError} from 'ts-extras';

import {frame} from '../helpers/dom-utils.js';
import {logError} from '../helpers/errors.js';

/** Keep in mind that when executing concurrently, there might be multiple menus open. Adjust your selectors accordingly. */
export default async function withMenuOpen<T>(menuButton: HTMLButtonElement, callback: () => T): Promise<T | undefined> {
	menuButton.click();
	// Wait for the menu DOM to be created, but not rendered
	await frame();

	let result: T | undefined;
	try {
		result = callback();
	} catch (error) {
		assertError(error);
		logError(error);
	} finally {
		menuButton.click();
	}

	return result;
}
