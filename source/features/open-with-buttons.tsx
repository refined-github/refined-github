import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';

function addLinkButton(template: Element, text: string, href: string): void {
	const item = template.cloneNode(true);
	const link = item.firstElementChild as HTMLAnchorElement;
	if (link.text === 'Download directory') {
		return;
	}

	link.href = href;
	link.textContent = text;
	link.ariaKeyShortcuts = 'o'; // Cloned download button is d, other open buttons are o

	template.before(item);
}

function add({parentElement: downloadZip}: Element): void {
	const url = new GitHubFileURL(location.href);
	const root = `https://${location.host}/${url.user}/${url.repository}`;

	// Link to root even if we're on a branch/commit, to match behaviour of other buttons + commandline
	// However, Codespaces does link to the current branch/commit
	addLinkButton(downloadZip!, 'Open with VS Code remote', `vscode://ms-vscode.remote-repositories/open?url=${root}`); // ?url doesn't support files, other parameters are unknown
	addLinkButton(downloadZip!, 'Open with VS Code Dev Container', `vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=${root}`); // Can't open files
}

function init(signal: AbortSignal): void {
	observe('a[aria-keyshortcuts="d"]', add, {signal}); // "Download ZIP" button
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
	exclude: [
		pageDetect.isEmptyRepoRoot,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/tree/main
https://github.com/refined-github/refined-github/tree/ad0054477020c52e7140278200be00fc764cc469

*/
