import './hide-navigation-hover-highlight.css';

import features from '../feature-manager.js';

const attribute = 'rgh-no-navigation-highlight';
const html = document.documentElement;

function init(): void {
	html.setAttribute(attribute, '');
	html.addEventListener('navigation:keydown', () => {
		html.removeAttribute(attribute);
	}, {once: true});
}

void features.add(import.meta.url, {
	init,
});

/*

Test URLs

- Notifications list: https://github.com/notifications
- Issue list: https://github.com/refined-github/refined-github/issues
- React file list: https://github.com/refined-github/refined-github/tree/main/.github
- File list: https://github.com/refined-github/refined-github

*/
