import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';

async function handler({key, target}: KeyboardEvent): Promise<void> {
	if (key === 'y' && !isEditable(target)) {
		const url = location.href;
		// make the URL a permalink with title.text being the text of the link
		const title = document.querySelector('title')?.textContent;
		if (title) {
			// Copy the URL to the clipboard
			// Check if the clipboard API is available
			if (!navigator.clipboard) {
				console.error('Clipboard API not available');
				return;
			}
			// Check if the user has granted permission to write to the clipboard
			const permission = await navigator.permissions.query({name: 'clipboard-write' as PermissionName});
			if (permission.state !== 'granted') {
				console.error('Clipboard permission not granted');
				return;
			}
			// Copy the URL to the clipboard
			try {
				const text = `${title} (${url})`;
				const permalink = `<a href="${url}">${title}</a>`;
				await navigator.clipboard.write([
					new ClipboardItem({
						'text/plain': new Blob([text], {type: 'text/plain'}),
						'text/html': new Blob([permalink], {type: 'text/html'}),
					}),
				]);
				console.log('Copied title and URL to the clipboard as link and text\ntext:', text, '\nlink:', permalink);
				return;
			} catch (error) {
				console.error('Failed to copy URL to clipboard', error);
				return;
			}
		}
		await navigator.clipboard.writeText(url);
		// Log to ensure we're coping the new URL
		console.log('Copied URL to the clipboard', url);
	}
}

function init(signal: AbortSignal): void {
	globalThis.addEventListener('keyup', handler, {signal});
}

void features.add(import.meta.url, {
	init,
});
// TODO: Add visual popup, maybe use GitHub's own clipboard element

/*

Test URLs

> Any page, particularly it should work copy the permalink when `y` is pressed on:

https://github.com/refined-github/refined-github/blob/main/.gitignore

*/
