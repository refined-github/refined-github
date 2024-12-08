import filterAlteredClicks from 'filter-altered-clicks';
import {isSafari} from 'webext-detect';

function isLinkExternal(link: HTMLAnchorElement): boolean {
	return link.target === '_blank' // Explicit
		|| (
			!link.target // Not set
			&& Boolean(document.querySelector('base[target="_blank"]')) // Global default
		);
}

// WTF Safari. It opens target="_blank" links in the same tab on extension pages
if ('window' in globalThis && 'open' in globalThis && isSafari()) {
	document.addEventListener('click', filterAlteredClicks(event => {
		// WebComponents support https://stackoverflow.com/a/57963850
		const clicked = event.composedPath().find(element => element instanceof HTMLAnchorElement);
		if (clicked && isLinkExternal(clicked)) {
			event.preventDefault();
			window.open(clicked.href);
		}
	}));
}
