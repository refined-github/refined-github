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
	document.addEventListener('click', event => {
		const clicked = event.target;
		if (clicked instanceof HTMLAnchorElement && isLinkExternal(clicked)) {
			event.preventDefault();
			window.open(clicked.href);
		}
	});
}
