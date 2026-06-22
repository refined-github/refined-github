import {frame} from '../helpers/dom-utils.js';

export default async function withMenuOpen<T>(menuButton: HTMLButtonElement, callback: () => T): Promise<T> {
	menuButton.click();
	await frame();
	const result = callback();
	menuButton.click();
	return result;
}
